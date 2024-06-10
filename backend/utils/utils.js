const EPSILON = 0.000001;

// give 10 milliseconds of error room because methods in-between will take multiple milliseconds to complete:w
const MILLISECOND_EPSILON = -1;

let epsilon_equal = (a, b) => {
  return Math.abs(a - b) < EPSILON ? true : false;
}

module.exports = {
  EPSILON,
  MILLISECOND_EPSILON,
  epsilon_equal
};
