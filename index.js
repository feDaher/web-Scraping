const pup = require('puppeteer')

const url = 'https://www.pneufree.com.br/'
const searchFor = '195/65/R15' 
let count = 1
const list = []

async function run () {
    const browser = await pup.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});
    await page.goto(url);
    await page.waitForSelector('.m--hidden-tablet-and-mobile', {delay: 50});
    await page.type('#pesquisa_produto', searchFor)
    
    let navigationPromisse = page.waitForNavigation()
    await page.keyboard.press('Enter');
    await navigationPromisse

    const links = await page.$$eval('.col-auto > a', el => el.map(link => link.href))

    for(link of links){
      console.log('Pagina:', count)
      await page.goto(link)
      
      await page.waitForSelector('.d-flex')
      const text = await page.$eval('.pneutitulo', element => {
        const parentNode = element.parentNode;
        let nextNode = element.nextSibling;
        while (nextNode && nextNode.nodeType !== Node.TEXT_NODE) {
          nextNode = nextNode.nextSibling;
        }
          return nextNode ? nextNode.textContent.trim() : '';
      });
      const model = await page.$eval('.modelopneu', element => element.innerText)
      const price = await page.$$eval('.d-flex > span', spans => {
        return spans.map(span => span.innerHTML)
          .filter((_, index) => index <= 1)
      });
      
      const obj = {}
      obj.text = text
      obj.model = model
      obj.price = price 
      obj.link = link
    
      list.push(obj)
      
      count++
    }

    console.log(list)

    await page.waitForTimeout(3000)
    await browser.close()
}

run()
