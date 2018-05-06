//MESSAGING
const responses = {
    successResponse: (data) => {
        return ({
            status: "Success",
            data: data
        });
    },
    errorResponse: (reason) => {
        return ({
            status: "Error",
            reason: reason
        });
    }
}

//DATES
const twoDigits = (d) => {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

const dates = {
    string: {
        short: (d) => {
            return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        },
        long: (d) => {
            return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        },
        mysql: (d) => {
            return d.getUTCFullYear() + "-" + twoDigits(1 + d.getUTCMonth()) + "-" + twoDigits(d.getUTCDate()) + " " + twoDigits(d.getHours()) + ":" + twoDigits(d.getUTCMinutes()) + ":" + twoDigits(d.getUTCSeconds());
        }
    }
}

//VALIDATION
const validation = {
    email: (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    password: (password) => {
        if (str.length < 6) return ("is too short");
        else if (str.length > 50) return ("is too long");
        else if (str.search(/\d/) == -1) return ("contains no numbers");
        else if (str.search(/[a-zA-Z]/) == -1) return ("contains no letters");
        else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) return ("contains an invalid character");
        else return ("is valid");
    }
}

module.exports = {
    responses: responses,
    validation: validation,
    dates: dates
};