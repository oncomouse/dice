const fetch = require('isomorphic-fetch')
const {
  add,
  adjust,
  always,
  equals,
  is,
  length,
  map,
  match,
  max,
  min,
  not,
  nth,
  pipe,
  replace,
  split,
  sum,
  tap,
  trim,
  when,
  update,
} = require('ramda')
const argv = require('minimist')(process.argv.slice(2), {
  boolean: [
    'advantage',
    'disadvantage',
  ]
})

const parseBase10 = x => parseInt(x, 10)
const parseInput = pipe(
  match(/[0-9]+d(100|20|12|10|8|6|4)(\s*\+\s*[0-9]+){0,1}/),
  // No matches found:
  when(pipe(length, equals(0)), always(['1', '20', '0'])),
  // No bonus was found:
  when(pipe(nth(2), is(String), not), update(2, '0')),
  // Remove the + from the bonus:
  adjust(2, replace(/\s*\+\s*/g, '')),
  // Convert to integers:
  map(parseBase10)
)

const countNat1And20 = xs => {
  const [nat1Count, nat20Count] = xs.reduce((count, die) => {
    if (die === 1) {
      return adjust(0, add(1), count)
    }
    if (die === 20) {
      return adjust(1, add(1), count)
    }
    return [...count]
  }, [0, 0])
  if (nat1Count > 0) {
    console.log(`Natural 1${nat1Count === 1 ? '' : 's'}: ${nat1Count}`)
  }
  if (nat20Count > 0) {
    console.log(`Natural 20${nat20Count === 1 ? '' : 's'}: ${nat20Count}`)
  }
}
const callRandomOrg = async function (sides, count) {
  return await fetch(`https://www.random.org/integers/?num=${count}&min=1&max=${sides}&col=1&base=10&format=plain&rnd=new`)
    .then(res => res.text())
    .then(
      pipe(
        trim,
        split('\n'),
        map(parseBase10)
      )
    )
}
const advantageOrDisadvantage = async function (advantage) {
  const dice = await callRandomOrg(20, 2)
  return advantage ? max(...dice) : min(...dice)
}
const results = async function (sides = 20, count = 1) {
  return pipe(
    when(pipe(always(sides), equals(20)), tap(countNat1And20)),
    sum
  )(await callRandomOrg(sides, count))
};

(async function () {
  try {
    if (argv.advantage || argv.disadvantage) {
      const bonus = parseBase10(process.argv.slice(2).join(' ').replace(/\s+--(dis){0,1}advantage/, '').replace(/\s/g, ''))
      const roll = await advantageOrDisadvantage(argv.advantage)
      console.log(`${roll + (isNaN(bonus) ? 0 : bonus)}`)
      process.exit()
    }
    const [count, sides, bonus] = parseInput(argv._.join(' '))
    const roll = await results(sides, count)
    console.log(`${roll + bonus}`)
  } catch (error) {
    console.error(error)
  }
})()
