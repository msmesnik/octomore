'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTransformer = exports.createHttpRetriever = exports.createFileRetriever = exports.createDocument = undefined;

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _file = require('./retriever/file');

var _file2 = _interopRequireDefault(_file);

var _http = require('./retriever/http');

var _http2 = _interopRequireDefault(_http);

var _transformer = require('./transformer');

var _transformer2 = _interopRequireDefault(_transformer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createDocument = _document2.default;
exports.createFileRetriever = _file2.default;
exports.createHttpRetriever = _http2.default;
exports.createTransformer = _transformer2.default;