/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.arcgis.com",
				pathname: "/sharing/rest/content/items/**",
			},
		],
	},
};

export default nextConfig;
