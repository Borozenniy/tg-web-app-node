//32-00 - Время видео
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

// replace the value below with the Telegram token you receive from @BotFather

const token = '5541434736:AAFs2EC1d1RPJyhUUb1gTnXxicxfRCJIJz8';
const webAppUrl = "https://marvelous-eclair-5b9dab.netlify.app/";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === "/start") {
		await bot.sendMessage(chatId, 'Вітаю, нижче буде кнопка, заповни форму', {
			reply_markup: {
				keyboard: [
					[{ text: 'Заповнити форму', web_app: { url: webAppUrl + 'form' } }]
				]
			}
		})
	}

	if (text === "/start") {
		await bot.sendMessage(chatId, 'Заходь до нашому інтернет магазину по кнопці нижче', {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Зробити замовлення', web_app: { url: webAppUrl } }]
				]
			}
		})
	}

	// send a message to the chat acknowledging receipt of their message
	bot.sendMessage(chatId, 'Received your message');

	if (msg.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data)
			await bot.sendMessage(chatId, 'Дякую за звернення')
			await bot.sendMessage(chatId, 'Ваша країна: ' + data?.country)
			await bot.sendMessage(chatId, 'Ваша вулиця: ' + data?.street)
			setTimeout(async () => {
				await bot.sendMessage(chatId, 'Усю інформацію ви отримаєте у цьому чаті')

			}, 3000)
		} catch (e) {
			console.log(e);
		}
	}

});

app.post('/web-data', async (req, res) => {
	const { queryId, products = [], totalPrice } = req.body;
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Успешная покупка',
			input_message_content: {
				message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
			}
		})
		return res.status(200).json({});
	} catch (e) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Не удалось покупка',
			input_message_content: {
				message_text: ` Не получилось купить товар`
			}
		})
		return res.status(500).json({});
	}

})

const PORT = 3000;

app.listen(PORT, () => console.log('Server started on PORT: ' + PORT))