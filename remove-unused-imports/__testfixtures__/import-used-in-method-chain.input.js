import _ from "lodash";

const result = _.chain([1, 2, 3])
  .map((n) => n * 2)
  .value();

export default result;
