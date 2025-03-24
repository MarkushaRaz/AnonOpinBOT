const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const token = '7708145153:AAHcRVmQ9YQQ_7EW24IBMHTG-9D6cuOCVa8';
const bot = new TelegramBot(token, {polling:true});

let Data = GetData();

function SaveData(data) {
    fs.writeFileSync('Data.json', JSON.stringify(data, null, 2), 'utf8');
}

function GetData() {
    if (fs.existsSync('Data.json')) {
        const data = fs.readFileSync('Data.json', 'utf8');
        return JSON.parse(data);
    }
    return {};
}

// Start
bot.onText(/\/start/, (msg) => {
    const button1 = {
        reply_markup: {
            inline_keyboard: [
                [{text: "Создать опрос", callback_data: 'new'}],
                [{text: "Выбрать опрос", callback_data: 'select'}]
            ]
        }
    }
    const button2 = {
        reply_markup: {
            inline_keyboard: [
                [{text: "", callback_data: ''}]
            ]
        }
    }

    if (!Data[msg.chat.id]) {
        Data[msg.chat.id] = {
            "username": msg.from.username,
            "Opinions": {}
        }
        SaveData(Data);
    }

    bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg.from.first_name}!\n\nЧтобы создать свой анонимный опрос, нужно нажать кнопку:`, button1);

    bot.on('callback_query', (query) => {
        if (query.data === 'new') {
            let Count = 0;
            const NumOpinion = Object.keys(Data[query.message.chat.id].Opinions).length + 1;

            bot.sendMessage(query.message.chat.id, `<i><b>Опция: новый опрос</b></i>\n\nПоочерёдно в каждом сообщении вводите вопрос. Максимум может быть 10 вопросов. Если количество задаваемых вами вопросов меньше, то после последнего вопроса в следующем сообщении напишите слово "Стоп".\n<b>Примечание: В одном сообщении можно указывать только 1 вопрос!</b>\n\nПример:\n<i>На сколько лет я выгляжу?</i>`, {parse_mode:'HTML'});

            while (Count != 10) {
                bot.on('message', (msg) => {
                    if (msg.text === "Стоп") {
                        Count = 10;
                        SaveData(Data);
                        bot.sendMessage(msg.chat.id, '<i><b>Поздравляем!</b></i>\n<b>Опрос успешно создан!</b>\nЕго теперь можно использовать по команде\n<i>/start</i> и выбрать созданный опрос.', {parse_mode:'HTML'});
                    }
                    else {
                        Data[msg.chat.id].Opinions[NumOpinion] += [
                            ...Data[msg.chat.id].Opinions[NumOpinion],
                            msg.text
                        ];
                    }
                });
            }
            SaveData(Data);

            bot.sendMessage(query.message.chat.id, '<i><b>Поздравляем!</b></i>\n<b>Опрос успешно создан!</b>\nЕго теперь можно использовать по команде\n<i>/start</i> и выбрать созданный опрос.', {parse_mode:'HTML'});
        }
        else if (query.data === 'select') {
            bot.sendMessage(query.message.chat.id, '');

            for (let A of Object.keys(Data[query.message.chat.id].Opinions)) {}
        }
    });
});

// Message
bot.onText(/\/message( (.+))?/, (msg, match) => {
    if (match[2] == null) {
        bot.sendMessage(msg.chat.id, '<b>Ошибка. Не выбрано направление сообщения.</b>', {parse_mode:'HTML'});
    }
    else {
        Data[match[2]]
    }
});

console.log('> Successful start');