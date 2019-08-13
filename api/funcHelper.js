register = ($, dd) => {
  let ddtest = "";
  $(dd).each(function(index, element) {
    ddtest = $(element)
      .last()
      .text()
      .trim()
      .replace(/\s\s+/g, "");
  });
  return ddtest;
};

value = ($, cls) => {
  let value = "";
  $(cls).each(function(index, element) {
    value = $(element)
      .text()
      .trim()
      .replace(/\s\s+/g, "");
  });
  return value;
};

/*
 *  Pad right the strings
 */
pad = (width, string, padding) => {
  return width <= string.length
    ? string
    : pad(width, string + padding, padding);
};

module.exports.value = value;
module.exports.register = register;
module.exports.pad = pad;
