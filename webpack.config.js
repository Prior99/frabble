const GitRevisionPlugin = require("git-revision-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Webpack = require("webpack");

const path = require("path");
const gitRevision = new GitRevisionPlugin({ lightweightTags: true });


module.exports = {
    entry: {
        bundle: path.join(__dirname, "src", "index.tsx"),
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "dist/"
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.(woff|woff2|ttf|png|svg|ttf|eot)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                },
            },
            {
                test: /\.tsx?/,
                loader: "ts-loader",
                options: {
                    configFile: path.join(__dirname, "tsconfig.json"),
                },
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader, options: { publicPath: "." } },
                    { loader: "css-loader" },
                    { loader: "sass-loader" },
                ]
            }

        ],
    },
    devtool: "source-map",
    plugins: [
        new Webpack.DefinePlugin({
            // Taken and adapted from the official README.
            // See: https://www.npmjs.com/package/git-revision-webpack-plugin
            "SOFTWARE_VERSION": JSON.stringify(gitRevision.version())
        }),
        new MiniCssExtractPlugin(),
    ]
};


