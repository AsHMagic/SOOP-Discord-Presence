const ClientID = '1223858213955436575'
const DiscordRPC = require('discord-rpc');
const RPC = new DiscordRPC.Client({ transport: 'ipc'});
const env = require('dotenv');
env.config()

DiscordRPC.register(ClientID)

async function activity(url, channel_id) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'
            }
        });
        if (response.ok) {
            const data = await response.json();
            let live_info = data.broad;
            if (live_info != null) {
                //console.log(live_info)
                let soop_station = data.station;
                let soop_live_title = live_info.broad_title;
                let soop_user_count = live_info.current_sum_viewer;
                let soop_channel_name = soop_station.user_nick;
                let soop_live_no = live_info.broad_no;

                const res = await fetch('https://live.sooplive.co.kr/afreeca/player_live_api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'bid=' + channel_id,
                });
                const cate_data = await res.json();
                let category;
                if (cate_data.CHANNEL.CATE) {
                    category = await get_soop_category(cate_data.CHANNEL.CATE);
                }
                else {
                    category = "기타";
                }
                
                if (RPC) {
                    RPC.setActivity({
                        state: `${category} 하는 중`,
                        details: soop_live_title,
                        largeImageKey: `https://liveimg.sooplive.co.kr/m/${soop_live_no}`,
                        largeImageText: `${soop_channel_name} - ${soop_user_count.toLocaleString()}명 시청 중`,
                        smallImageKey: 'https://cdn.discordapp.com/avatars/1223858213955436575/8addfe6c8f94485bd87fd3c5281faae5.webp?size=256',
                        buttons: [
                            {
                                label: '보기',
                                url: `https://play.sooplive.co.kr/${channel_id}/${soop_live_no}`
                            }
                        ]
                    });
                }
            }
        } else {
            console.error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function get_soop_category(category_no) {
    const res_1 = await fetch('https://live.sooplive.co.kr/script/locale/ko_KR/broad_category.js', {
        method: 'POST',
        headers: { 'Content-Type': 'text/javascript' },
    });

    const data_1 = await res_1.text();
    let end = data_1.indexOf(`"${category_no}"`);
    const cate_name = `"cate_name"`;
    let start = data_1.lastIndexOf(cate_name, end);
    start = data_1.indexOf('"', start + cate_name.length);
    end = data_1.indexOf('"', start + 1);
    const name = data_1.substring(start + 1, end);
    if (name.length > 50) {
        return '기타';
    }
    else {
        return name
    }
}

RPC.on('ready', async () => {
    console.log("SOOP 활동상태 ON")
    
    const channel_id = process.env.CHANNEL_ID
    const url = `https://chapi.sooplive.co.kr/api/${channel_id}/station`

    activity(url, channel_id);

    setInterval(() => {
        activity(url, channel_id);               
    }, process.env.TIME);
})

RPC.login({ clientId: ClientID });
