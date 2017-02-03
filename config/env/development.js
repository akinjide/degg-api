const config = {
  mongodb: {
    hostname: 'localhost',
    db: 'degg_db',
    port: 27017,
    connectionString: process.env.connectionString || 'localhost/degg_db'
  },
  inputToken: process.env.logglyInputToken,
  subdomain: process.env.logglySubdomain
};

export default config;
