# nodecg-cartographer

Cartographer is a modular, schema-driven layout system for NodeCG overlays. You define
a bunch of React components and a bunch of ways in which those components are organized,
and Cartographer handles all the alignment and dependency injection and stuff.

## Installation

```bash
nodecg install corvimae/nodecg-cartographer
cd bundles/nodecg-cartographer
yarn # or `npm install`
yarn build # or `npm run build`
```

## Creating Layouts

Cartographer loads all YAML layouts present at `$NODECG_ROOT/layouts` (by default, this is a `layouts` folder at your NodeCG installation). To create a new layout, add a new YAML file  to the `layouts` folder with the following:

```yaml
name: my-layout
root:
```

To view your layout, add the `layout.html` graphic as a browser source in OBS, and add the query parameter `layout=your-layout-name`.

You can then add one or more layout items to `root`. A layout item must specify its `type`, and may specify any of these properties:

`width` - The width of the layout item's container. Accepts any valid CSS sizing value, or `stretch` to fill the remaining width in the parent. `width: stretch` is ignored if the parent element is a `column`.

`height` - The height of the layout item's container. Accepts any valid CSS sizing value, or `height` to fill the remaining width in the parent. `height: stretch` is ignored if the parent element is a `row`.

`padding` - The padding of the layout item's container. Accepts any valid CSS sizing value, an object with any/all of the keys `top`, `bottom`, `left`, `right`, `vertical`, `horizontal`.

`margin` - The margin of the layout item's container. Accepts any valid CSS sizing value, an object with any/all of the keys `top`, `bottom`, `left`, `right`, `vertical`, `horizontal`.

Some modules may implement additional properties; refer to the documentation for the module as necessary.

By default, Cartographer comes with these layout item types:

#### `column`
A column that contains any number of child components.

`children` (array of layout items) - The child layout items.

`justify` (string) - The vertical justification of the items in the column.
`alignItems` (string) - The horizontal justification of the items in the column.

#### `row`
A row that contains any number of child components.

`children` (array of layout items) - The child layout items.
`justify` (string) - The horizontal justification of the items in the row.
`alignItems` (string) - The vertical justification of the items in the row.

#### `source`
A blank space for an OBS source. Note that you are responsible for sizing and aligning your sources in OBS to the space left by Cartographer.

`resolution` (`WxH` e.g. `4x3`) - The resolution of the source. Cartographer will automatically resize the source based on the parent's dimensions.

`id` (string, optional) - A reminder for what this source item represents in OBS

If `debug=1` is set in the query parameters, source elements will show their position and dimensions as well as their ID. By default, these values are floored; if the query parameter `metricRounding=0` is specified, they will be truncated to 2 decimal places instead.


#### `div`
A generic div. Accepts any property that React accepts for a div, as well as:

`text` (string) - The text to display in the div.

#### Additional schema properties

Along with `name` and `root`, your schema may specify these optional properties:

`sourceWrapper` - A layout item that will surround any `source` items.

#### Custom Layout Items
Other NodeCG bundles can define their own additional layout items; almost any overlay will need to implement its own layout items, as Cartographer does not implement any use case-specific features.

1. Create a new NodeCG bundle like any other, and add `"cartographer": true` to the `nodecg` object in your `package.json`.
1. Install Parcel and React.

    ```bash
      yarn add react && yarn add parcel --dev
    ```
1. Create a new Javascript file at `src/module.js`.
1. Define one or more components with `cartographer.register(componentName, componentFunction)`

    ```js
    cartographer.register('timer', () => {
      const [timer] = cartographer.useReplicant('timer', {}, {
        namespace: 'nodecg-speedcontrol',
      });

      return (
        <div className="timer">
          {timer.time}
        </div>
      );
    });
    ```

    The global `cartographer` object also exposes the `useReplicant` and `useListenFor` hooks, originally from [use-nodecg](https://github.com/Hoishin/use-nodecg).

    **NOTE:** The global `cartographer` object exposes the React hooks `useEffect`, `useState`, `useCallback`, `useMemo`, and `useRef`. You **MUST** use these versions in order to prevent issues with mismatched `react` instances.

1. If needed, create a `css` directory and add one or more CSS files.

1. Use your new component! :)

    ```yaml
      name: my-layout
      root:
      - type: timer
    ```

## Example Layout

```yaml
name: cool-speedrun-layout
root:
- type: column
  width: stretch
  children:
  - type: source
    id: webcam
    resolution: 4x3
  - type: timer
- type: column
  width: 1440
  children:
  - type: source
    id: game-feed
    resolution: 16x9
  - type: column
    height: stretch
    children:
    - type: div
      text: Put something here!
```