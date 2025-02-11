var glob = require("glob");
var path = require("path");

module.exports = [
    {
        entry: glob.sync(
            "./src/assets/**/*.jsx",
            {ignore: [
                "./src/assets/blocks/editor-sidebar/*.jsx",
                "./src/assets/blocks/**/*.frontend.jsx"
            ]}
            ),
        devtool: 'source-map',
        output: {
            path: path.join(__dirname, "src", "assets", "blocks"),
            filename: "blocks.js"
        },

        module: {
            rules: [
                {
                    test: /\.(jsx)$/, // Identifies which file or files should be transformed.
                    use: { loader: "babel-loader" }, // Babel loader to transpile modern JavaScript.
                    exclude: [
                        /(node_modules|bower_components)/,
                    ]// JavaScript files to be ignored.
                }
            ]
        }
    },
    {
        entry: glob.sync(
            "./src/assets/blocks/editor-sidebar/post-sidebar.jsx",
            ),
        devtool: 'source-map',
        output: {
            path: path.join(__dirname, "src", "assets", "blocks"),
            filename: "post-sidebar.js"
        },

        module: {
            rules: [
                {
                    test: /\.(jsx)$/, // Identifies which file or files should be transformed.
                    use: { loader: "babel-loader" }, // Babel loader to transpile modern JavaScript.
                    exclude: [
                        /(node_modules|bower_components)/,
                    ]// JavaScript files to be ignored.
                }
            ]
        }
    },
    {
        entry: glob.sync("./src/assets/**/*.frontend.jsx"),
        devtool: 'source-map',
        output: {
            path: path.join(__dirname, "src", "assets", "blocks"),
            filename: "frontend.js"
        },

        module: {
            rules: [
                {
                    test: /\.(frontend.jsx)$/, // Identifies which file or files should be transformed.
                    use: { loader: "babel-loader" }, // Babel loader to transpile modern JavaScript.
                    exclude: /(node_modules|bower_components)/ // JavaScript files to be ignored.
                }
            ]
        }
    }
];
