const fs = require('fs');
const os = require('os');
const { sep } = require('path');
const axios = require('axios').default;
const sleep = sec => new Promise(r => setTimeout(r, (sec * 1000)));
/**
   * 
   * @param {string} username Username of the user you want to log into
   * @param {string} descriminator descriminator of the user if you have multiple accounts with the same name
   * @private
   */
async function getToken(username, descriminator) {
    var token = /[A-Za-z\d]{24}\.[\w]{6}\.[\w]{27}/;
    var mfaToken = /mfa\.[\w-]{84}/;
    var WinLocation = `C:${sep}Users${sep}${os.userInfo().username}${sep}AppData${sep}Roaming`;
    var linLocation = `${sep}home${sep}${os.userInfo().username}${sep}.config`;

    var x = [];
    var y = [];
    let userToken;

    let found = false;

    const getSortedFiles = async (dirs) => {
        var temp = [];
        dirs.forEach(async dir => {
            dir += `${sep}Local Storage${sep}leveldb`;
            var exists = fs.existsSync(dir);

            if (!exists) return null;

            let files = await fs.promises.readdir(dir);
            files.forEach(f => {
                if (f.endsWith('.ldb')) {
                    temp.push(`${dir}${sep}${f}`)
                }
                else if (f.endsWith('.log')) {
                    temp.push(`${dir}${sep}${f}`)
                }
                else return;
            });
        });

        return temp;
    }

    if (os.type().toLowerCase().includes('windows')) {
        let paths = [
            `${WinLocation}${sep}discord`,
            `${WinLocation}${sep}discordptb`,
            `${WinLocation}${sep}discordcanary`,
        ]

        x = await getSortedFiles(paths);

        setTimeout(async () => {
            x.forEach(async f => {
                fs.readFile(f, function (err, data) {
                    if (err) throw err;
                    data = data.toString();

                    if (token.test(data)) {
                        let z = token.exec(data);

                        let t = z[0];
                        if(token.test(t)) if (y.indexOf(t) === -1) y.push(t);
                    } else if (mfaToken.test(data)) {
                        let z = mfaToken.exec(data);

                        let t = z[0];
                        if (mfaToken.test(t)) if (y.indexOf(t) === -1) y.push(t);
                    }
                });
            });

            setTimeout(() => {
                y.forEach(async t => {
                    if (found === false) {
                        await axios.get('https://discord.com/api/v7/users/@me', {
                            headers: {
                                "Content-Type": "application/json",
                                "authorization": t,
                            }
                        }).then(async (res) => {
                            const d = res.data;
                            if (d.username == username) {
                                if (descriminator !== null) {
                                    if (d.descriminator == descriminator) {
                                        found = true
                                        userToken = t;
                                        return;
                                    } else return null;
                                }
                                found = true;
                                userToken = t;
                            }
                        }).catch(e => {
                            if(e.toString().includes('401')) return;
                            else console.error(e);
                        });
                    }
                });
            }, 2000)

            
        }, 500);
    } else if (os.type().toLowerCase().includes('linux')) {
        let paths = [
            `${linLocation}${sep}discord`,
            `${linLocation}${sep}discordptb`,
            `${linLocation}${sep}discordcanary`,
        ]

        x = await getSortedFiles(paths);

        setTimeout(async () => {
            x.forEach(async f => {
                fs.readFile(f, function (err, data) {
                    if (err) throw err;
                    data = data.toString();

                    if (token.test(data)) {
                        let z = token.exec(data);

                        let t = z[0];
                        if(token.test(t)) if (y.indexOf(t) === -1) y.push(t);
                    } else if (mfaToken.test(data)) {
                        let z = mfaToken.exec(data);

                        let t = z[0];
                        if (mfaToken.test(t)) if (y.indexOf(t) === -1) y.push(t);
                    }
                });
            });

            setTimeout(() => {
                y.forEach(async t => {
                    if (found === false) {
                        await axios.get('https://discord.com/api/v7/users/@me', {
                            headers: {
                                "Content-Type": "application/json",
                                "authorization": t,
                            }
                        }).then(async (res) => {
                            const d = res.data;
                            if (d.username == username) {
                                if (descriminator !== null) {
                                    if (d.descriminator == descriminator) {
                                        found = true
                                        userToken = t;
                                        return;
                                    } else return null;
                                }
                                found = true;
                                userToken = t;
                            }
                        }).catch(e => {
                            if(e.toString().includes('401')) return;
                            else console.error(e);
                        });
                    }
                });
            }, 2000)

            
        }, 500);
    } else {
        throw new Error(`This is not yet developed on this os`);
    }

    await sleep(3);

    if (!found) return 'No Token';
    else return userToken;
};

module.exports = getToken;