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
                let afreeca_station = data.station;
                let afreeca_broad = data.broad;
                let afreeca_live_title = live_info.broad_title;
                let afreeca_user_count = live_info.current_sum_viewer;
                let afreeca_channel_name = afreeca_station.user_nick;
                let afreeca_live_no = live_info.broad_no;
                if (RPC) {
                    RPC.setActivity({
                        details: afreeca_live_title,
                        largeImageKey: `https://liveimg.afreecatv.com/m/${afreeca_live_no}`,
                        largeImageText: `${afreeca_channel_name} - ${afreeca_user_count.toLocaleString()}명 시청 중`,
                        smallImageKey: 'https://cdn.discordapp.com/avatars/1223858213955436575/3b5aa5d6427d0b986c38bcdec2756d19?size=256',
                        buttons: [
                            {
                                label: '보기',
                                url: `https://play.afreecatv.com/${channel_id}/${afreeca_live_no}`
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


RPC.on('ready', async () => {
    console.log("아프리카TV 활동상태 ON")
    
    const channel_id = process.env.CHANNEL_ID
    const url = `https://bjapi.afreecatv.com/api/${channel_id}/station`

    activity(url, channel_id);

    setInterval(() => {
        activity(url, channel_id);               
    }, process.env.TIME);
})

RPC.login({ clientId: ClientID });