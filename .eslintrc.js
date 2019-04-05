module.exports = {
  root: true,

  env: {
    browser: true,
    node: true
  },

  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "no-underscore-dangle": "off",
    "comma-dangle": "off",
    "no-param-reassign": [
      "error",
      {
        props: true,
        ignorePropertyModificationsFor: [
          "state",
          "acc",
          "e",
          "ctx",
          "req",
          "request",
          "res",
          "response"
        ]
      }
    ]
  },
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  extends: ["@vue/typescript"],
  overrides: [
    {
      files: ["src/*.ts"]
    }
  ]
};
