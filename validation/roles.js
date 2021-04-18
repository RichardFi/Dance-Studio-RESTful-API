const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function () {
    ac.grant("basic")
        .readOwn("user")
        .updateOwn("user")

    ac.grant("admin")
        .extend("basic")
        .readAny("user")
        .updateAny("user")
        .deleteAny("user")

    return ac;
})();