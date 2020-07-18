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

const parseBase10 = x => parseInt(x, 10)
const parseInput = pipe(
  match(/[0-9]+d(4|6|8|10|12|20|100)(\s*\+\s*[0-9]+){0,1}/),
  when(pipe(length, equals(0)), () => {
    throw new Error(`Incorrect input!`)
  }),
  when(pipe(nth(2), is(String), not), update(2, '0')),
  adjust(2, replace(/\s*\+\s*/g, '')),
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
const results = async function (sides = 6, count = 1) {
  return await fetch(`https://www.random.org/integers/?num=${count}&min=1&max=${sides}&col=1&base=10&format=plain&rnd=new`)
    .then(res => res.text())
    .then(trim)
    .then(split('\n'))
    .then(map(parseBase10))
    .then(when(pipe(always(sides), equals(20)), tap(countNat1And20)))
    .then(sum)
};

(async function () {
  const [count, sides, bonus] = parseInput(process.argv.slice(2).join(' '))
  const roll = await results(sides, count)
  console.log(`${roll + bonus}`)
})()
