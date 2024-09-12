// requier package
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// middleware
const { createProxyMiddleware } = require("http-proxy-middleware");

// an instance of express app
const app = express();

// middleware settings
app.use(cors()); // enable cors // you need CORS when you want to pull data from external APIs that are public or authorized. // authorized resource sharing with external third parties. //
app.use(helmet()); //  helps you secure HTTP headers returned by your Express apps.
app.use(morgan()); // to simplify http requests and responses with error log in console.
app.disable(x - powered - by); // hide expree server information.

// routes and microservices lis
const services = [
	{
		route: "/api/v1/auth",
		target: "http://localhost:3001",
	},
	{
		route: "/api/v1/users",
		target: "http://localhost:3002",
	},
	{
		route: "/api/v1/products",
		target: "http://localhost:3003",
	},
	{
		route: "/api/v1/orders",
		target: "http://localhost:3004",
	},
	{
		route: "/api/v1/payments",
		target: "http://localhost:3005",
	},
	{
		route: "/api/v1/shipping",
		target: "http://localhost:3006",
	},
	{
		route: "/api/v1/notifications",
		target: "http://localhost:3007",
	},
	{
		route: "/api/v1/search",
		target: "http://localhost:3008",
	},
	{
		route: "/api/v1/admin/users",
		target: "http://localhost:3009",
	},
	{
		route: "/api/v1/admin/products",
		target: "http://localhost:3010",
	},
	{
		route: "/api/v1/admin/orders",
		target: "http://localhost:3011",
	},
	{
		route: "/api/v1/admin/payments",
		target: "http://localhost:3012",
	},
	{
		route: "/api/v1/admin/shipping",
		target: "http://localhost:3013",
	},
	{
		route: "/api/v1/admin/notifications",
		target: "http://localhost:3014",
	},
	{
		route: "/api/v1/admin/search",
		target: "http://localhost:3015",
	},
	{
		route: "/api/v1/admin/settings",
		target: "http://localhost:3016",
	},
	{
		route: "/api/v1/admin/logs",
		target: "http://localhost:3017",
	},
	{
		route: "/api/v1/admin/help",
		target: "http://localhost:3018",
	},
	{
		route: "/api/v1/admin/terms",
		target: "http://localhost:3019",
	},
	{
		route: "/api/v1/admin/about",
		target: "http://localhost:3020",
	},
	{
		route: "/api/v1/admin/contact",
		target: "http://localhost:3021",
	},
	{
		route: "/api/v1/admin/faq",
		target: "http://localhost:3022",
	},
];

// define rate limit
const rateLimit = 20; //max request per minute
// const limiter = require("express-rate-limit");
const interval = 60 * 1000; // time window in milliseconds (1 minute)

// Object to store request counts for each IP address
const requestCounts = {};

// Reset request count for each IP address every 'interval' milliseconds
setInterval(() => {
	Object.keys(requestCounts).forEach((ip) => {
		requestCounts[ip] = 0; // Reset request count for each IP address
	});
}, interval);

// Apply rate limit middleware to request
// Middleware function for rate limiting and timeout handling
function rateLimitAndTimeout(req, res, next) {
	const ip = req.ip; // Get client IP address

	// Update request count for the current IP
	requestCounts[ip] = (requestCounts[ip] || 0) + 1;

	// Check if request count exceeds the rate limit
	if (requestCounts[ip] > rateLimit) {
		// Respond with a 429 Too Many Requests status code
		return res.status(429).json({
			code: 429,
			status: "Error",
			message: "Rate limit exceeded.",
			data: null,
		});
	}

	// Set timeout for each request (example: 10 seconds)
	req.setTimeout(15000, () => {
		// Handle timeout error
		res.status(504).json({
			code: 504,
			status: "Error",
			message: "Gateway timeout.",
			data: null,
		});
		req.abort(); // Abort the request
	});

	next(); // Continue to the next middleware
}

// Apply the rate limit and timeout middleware to the proxy
app.use(rateLimitAndTimeout);

// Set up proxy middleware for each microservice
services.forEach(({ route, target }) => {
	// Proxy options
	const proxyOptions = {
		target,
		changeOrigin: true,
		pathRewrite: {
			[`^${route}`]: "",
		},
	};

	// Apply rate limiting and timeout middleware before proxying
	app.use(route, rateLimitAndTimeout, createProxyMiddleware(proxyOptions));
});

// Handler for route-not-found
app.use((_req, res) => {
	res.status(404).json({
		code: 404,
		status: "Error",
		message: "Route not found.",
		data: null,
	});
});

// port for the server
const port = process.env.PORT || 3000;

// start the server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
