
export function getFlags(user){
    const role = user?.role;

    return {
        isAdmin: role === "admin",
        isManager: role === "manager",

        farm:{
            create: role === "admin" || role === "manager",
            assignManager: role === "admin",
            edit: role === "admin" || role === "manager",
        }

    };
}