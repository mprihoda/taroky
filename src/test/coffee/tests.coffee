module "example tests"

test "HTML5 Boilerplate is sweet", ->
  expect 1
  equals "boilerplate".replace("boilerplate", "sweet"), "sweet", "Yes. HTML5 Boilerplate is, in fact, sweet"
