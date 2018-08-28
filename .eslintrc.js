module.exports = {
    "env": {
        "node": true
    },
    "extends": "airbnb",
    "parserOptions": {
        "ecmaVersion": 2018
    },
        'rules': {
            'global-require': 0,
            'import/no-unresolved': 0,
            'no-param-reassign': 0,
            'no-shadow': 0,
            'import/extensions': 0,
            'import/newline-after-import': 0,
            'no-multi-assign': 0,
            // allow debugger during development
            'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
            "no-console": "off",
            'no-template-curly-in-string': "off",
            'prefer-template':'off',
          }
};