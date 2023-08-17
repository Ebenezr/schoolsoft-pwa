module.exports = {
	globDirectory: 'build/',
	globPatterns: [
		'**/*.{json,ico,html,txt,css,js}'
	],
	swDest: 'build/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/,
		/^node_modules/
	]
};