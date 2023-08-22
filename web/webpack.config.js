const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: './typescript/index.ts',
    cache: true,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [{
                    loader: 'ts-loader',
                }],
                exclude: /node_modules/,
            },
            {
                // test: /\.(s(a|c)ss)$/,
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: () => {
                                    [
                                        require(autoprefixer)
                                    ];
                                }
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [
                                    path.resolve(__dirname, 'node_modules/foundation-sites/scss'),
                                    path.resolve(__dirname, 'node_modules/motion-ui/src'),
                                ]
                            }
                        }
                    }
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        // filename: 'bundle.js',
        path: path.resolve(__dirname, 'assets/build'),
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'foundation_styles.min.css'
        })
    ]
}