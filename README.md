# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Marathon plan schedules

The week-by-week tables in the marathon training plan posts are generated from `scripts/marathon_plans.py`. After changing a schedule, run `python3 scripts/marathon_plans.py` to check progression (weekly increases, cutback weeks, taper, peak long run timing); it exits non-zero if any check fails.

## Product specs

Every running watch and shoe spec quoted in posts (MSRP, battery, weight, drop, stack, status) lives in `src/data/products.json`, with a source URL and `last_checked` date per product. Run `python3 scripts/check_products.py` after editing a product post: it fails if a post states a spec that differs from the data file or recommends a superseded model, and warns when an entry hasn't been checked for 6 months.
