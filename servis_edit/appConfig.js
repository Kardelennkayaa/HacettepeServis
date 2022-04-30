var developmentDatabase = {
    postgres: {
    host: 'localhost',
    port: 5432,
    database: 'd9m22slngbh4er',
    user: 'zfdmjepycjwbxc',
    password: 'dc600e2398001a8c61a4ac7af3ea7d8dd457f93f4b9c08cde9b918b0a1ed8857'
    }
    }
    
    var connectionString = "postgres://zfdmjepycjwbxc:dc600e2398001a8c61a4ac7af3ea7d8dd457f93f4b9c08cde9b918b0a1ed8857@ec2-18-235-45-217.compute-1.amazonaws.com:5432/d9m22slngbh4er";
    if (process.env.NODE_ENV == 'production') {
    //Production mode
    if (process.env.DATABASE_URL) {
    developmentDatabase =
    parseConnectionString(process.env.DATABASE_URL);
    } else {
    console.log("process.env.DATABASE_URL empty, connectionStringvariable used");
    developmentDatabase = parseConnectionString(connectionString);
    }
    }else{
    //Development mode
    developmentDatabase = parseConnectionString(connectionString);
    }
    function parseConnectionString(connectionString) {
    if (connectionString) {
    var myRegexp = /(\w+):(\w+)@(.+):(\w+)\/(\w+)/g;
    var match = myRegexp.exec(connectionString);
    if (match.length == 6) {
    developmentDatabase.postgres.user = match[1];
    developmentDatabase.postgres.password = match[2];
    developmentDatabase.postgres.host = match[3];
    developmentDatabase.postgres.port = Number(match[4]);
    developmentDatabase.postgres.database = match[5];
    developmentDatabase.postgres.ssl = true;
    return developmentDatabase;
    }
    }
    console.log("connectionString cannot be parsed");
    return null;
    }
    module.exports = {
    hostname: "http://localhost",
    port: 5656,
    database: {
    postgres: developmentDatabase.postgres
    }
    }