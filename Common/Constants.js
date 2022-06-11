const ROLES = ['ADMIN', 'PARENT', 'STUDENT'];
module.exports = {
    ROLES,
    rolesDict: () => {
        const tmp = {};
        ROLES.forEach(ele => tmp[ele] = ele.toLowerCase())
        return tmp;
    }
}