const fs = require('fs');
const os = require('os');
/**
   * 
   * @param {*} client Client
   * @param {string} username Username of the user you want to log into
   * @param {string} descriminator descriminator of the user if you have multiple accounts with the same name
   * @private
   */
function getToken(client, username, descriminator) {
    var token = /[A-Za-z\d]{24}\.[\w]{6}\.[\w]{27}/;
    var mfaToken = /mfa\.[\w-]{84}/;
    var WinLocation = `C:${sep}Users${sep}${os.userInfo().username}${sep}AppData${sep}Roaming`;
    const headers = client.options.http.headers;

    var x = [];
    var y = [];
    let userToken;

    let found = false;

    const getSortedFiles = async (dirs) => {
        dirs.forEach(async dir => {
            dir += `${sep}Local Storage${sep}leveldb`;
            var exists = fs.existsSync(dir);
            console.log(exists);

            if (!exists) return null;

            let files = await fs.promises.readdir(dir);
            files.forEach(f => {
                if (f.endsWith('.ldb')) x.push(`${dir}${sep}${f}`)
                else if (f.endsWith('.log')) x.push(`${dir}${sep}${f}`);
                else return;
            });
        });
    }

    if (os.type().toLowerCase().includes('windows')) {
        let paths = [
            `${WinLocation}${sep}discord`,
            `${WinLocation}${sep}discordptb`,
            `${WinLocation}${sep}discordcanary`,
        ]

        Promise.resolve().then(() => {
            getSortedFiles(paths);
        }).catch(console.error);

        setTimeout(async () => {
            x.forEach(f => {
                console.log(f);
                fs.readFile(f, function (err, data) {
                    if (err) throw err;
                    data = data.toString();

                    if (token.test(data)) {
                        console.log('found one')
                        let z = token.exec(data);

                        z.forEach(t => {
                            if (y.indexOf(t) === -1) y.push(t);
                        });
                    } else if (mfaToken.test(data)) {
                        console.log('found one')
                        let z = mfaToken.exec(data);

                        z.forEach(t => {
                            if (y.indexOf(t) === -1) y.push(t);
                        });
                    }
                });
            });
        }, 500);

        y.forEach(t => {
            if (!found) {
                axios.get('https://discord.com/api/v9/users/@me', {
                    headers: {
                        "Accept": "*/*",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": 'en-US,en;q=0.9',
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache",
                        "authorization": t,
                        "Referer": "https://discord.com/channels/@me",
                        "Sec-Ch-Ua": '" Not A;Brand";v="99" "',
                        "Sec-Ch-Ua-Mobile": '?0',
                        "Sec-Ch-Ua-Platform": '"iOS"',
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                        "X-Debug-Options": "bugReporterEnabled",
                        "X-Discord-Locale": 'en-US',
                        "Origin": "https://discord.com"
                    }
                }).then(res => {
                    const d = res.data;
                    if (d.username == username) {
                        if (descriminator !== null) {
                            if (d.descriminator == descriminator) {
                                found = true
                                userToken = t;
                            }
                        }
                        found = true;
                        userToken = t;
                    }
                }).catch(e => {
                    throw e;
                });
            }
        });

        if (!found) return null;
        else return userToken;
    } else {
        throw new Error(`This is not yet developed on this os`);
    }
};

module.exports = getToken;