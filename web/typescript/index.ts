import 'expose-loader?exposes=$!jquery';
// import $ from 'jquery';
require('what-input');
import 'foundation-sites';
import '../scss/foundation_styles.scss'
import './shape.ts';

$(document).foundation();