/**
 * Webpack configuration
 * 
 * @type {import('webpack').Configuration}
 * @description Configures webpack to:
 * - Bundle JavaScript and CSS entry points
 * - Extract CSS into separate files using MiniCssExtractPlugin
 * - Process and optimize images (PNG, JPG) with asset modules
 * - Minify CSS output using CssMinimizerPlugin
 * - Output bundled files to the app/dist directory
 * 
 * @property {string[]} entry - Entry points for the application (JavaScript and CSS)
 * @property {Object} output - Output configuration for bundled files
 * @property {string} output.filename - Name of the output JavaScript bundle
 * @property {string} output.path - Directory path for output files
 * @property {boolean} output.clean - Whether to clean the output directory before build
 * @property {Array} plugins - Webpack plugins used in the build process
 * @property {Object} module - Module configuration with rules for different file types
 * @property {Array} module.rules - Rules for processing different file types
 * @property {Object} optimization - Optimization settings including CSS minification
 */

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export default {
  entry: [path.resolve(__dirname) + '/app/scripts/index.js', path.resolve(__dirname) + '/app/styles/main.css'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app', 'dist'),
    clean: true
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 20000
          }
        }
      }
    ]
  },
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()]
  }
}
