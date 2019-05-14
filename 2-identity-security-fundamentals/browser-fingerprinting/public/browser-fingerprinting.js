// The following facets are all considered in browser fingerprinting:
// 	User Agent
// 	Plugins
// 	Fonts
// 	Videos
//	Supercookies
// 	HTTP Accept Header
// 	Timezone
// 	Cookies Enabled

var agent = navigator.userAgent;

console.log(`User agent ${agent}`)

var offset = new Date().getTimezoneOffset() / 60;

console.log(`Offset ${offset}`)

var width = window.screen.width;
var height = window.screen.height;

console.log(`Window resolution ${width} x ${height}`)

var plugins = navigator.plugins;

if(plugins.length < 1) {
	console.log('No plugins')
}
for (var i = 0; i < plugins.length; i++){
	console.log(`Plugin ${plugins[i].name}`);
}
