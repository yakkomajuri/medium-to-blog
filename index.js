import { query } from './query.js'
import fetch from 'node-fetch'
import TurndownService from 'turndown'
import fs from 'fs'
 

const getUserIdFromUsername = async (username) => {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${username}`)
    const resJson = await res.json()
    return resJson.feed.link.split('source=rss-')[1].split('---')[0]
}

const updateAuthorDetails = async (name, bio) => {
    const res = await fetch('https://raw.githubusercontent.com/gatsbyjs/gatsby-starter-blog/master/gatsby-config.js')
    let gatsbyConfigRaw = await res.text()
    let newGatsbyConfig = gatsbyConfigRaw.replace('Kyle Mathews', name)
    newGatsbyConfig = newGatsbyConfig.replace(/Gatsby Starter Blog/g, `${name}'s Blog`)
    if (bio) {
        newGatsbyConfig = newGatsbyConfig.replace('who lives and works in San Francisco building useful things.', bio)
    }
    fs.writeFileSync('./blog/gatsby-config.js', newGatsbyConfig)
}

const fetchUserPosts = async () => {
    const userId = await getUserIdFromUsername(process.env.MEDIUM_USERNAME)
    let isFirstRun = true
    let resJson = {}
    let cursor = 'L20000000000000' // some date in the distant future :D
    let posts = []
    while (isFirstRun || cursor) {
        const payload = {
            operationName: 'ProfilePubHandlerQuery',
            variables: {
                id: userId,
                homepagePostsLimit: 25,
                includeDistributedResponses: false,
                homepagePostsFrom: cursor 
            },
            query: query
        }
        const res = await fetch(`${process.env.MEDIUM_URL}/_/graphql`, {
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json"
            },
            method: "POST"
        })
        resJson = await res.json()
        if (isFirstRun) {
            isFirstRun = false
            await updateAuthorDetails(resJson.data.userResult.name, resJson.data.userResult.bio)
        }
        const postsData = resJson.data.userResult.homepagePostsConnection
        if (postsData) {
            posts = [...posts, ...postsData.posts]
            cursor = postsData.pagingInfo.next ? postsData.pagingInfo.next.from : ''
        } else {
            break
        }
    }
    return posts
}

const convertHtmlToParsedMarkdown = (postHtml, post) => {
    const turndownService = new TurndownService({ headingStyle: 'atx' })
    const articleHtml = postHtml.split(/(<article).*?(>)/)[3].split('</article')[0] // get only article content
    let postMarkdown = turndownService.turndown(articleHtml)
    postMarkdown = postMarkdown.replace(/(<img).*?(\/>)/g, '') // Remove useless <img> tags
    postMarkdown = postMarkdown.replace(/(\(https:\/\/miro.medium.com\/max\/)[0-9]../g, '(https://miro.medium.com/max/600/') // englarge images
    postMarkdown = postMarkdown.replace(/(\(https:\/\/miro.medium.com\/freeze\/max\/)[0-9]../g, '(https://miro.medium.com/freeze/max/600/') 
    postMarkdown = postMarkdown.split('min read')[1] // get rid of header stuff
    const postDate = new Date(post.firstPublishedAt).toISOString()
    postMarkdown = `---\ntitle: ${post.title.replace(/:/g, ' -')}\ndate: ${postDate}\ndescription: ${post.previewContent.subtitle.replace(/:/g, ' -')}\n---\n\n${postMarkdown}`
    return postMarkdown
}

const generateMarkdownFromPosts = async () => {
    const posts = await fetchUserPosts()
    const total = posts.length
    let i = 1
    fs.rmdirSync('./blog/content/blog', { recursive: true })
    fs.mkdirSync(`./blog/content/blog`)
    for (const post of posts) {
        console.log(`Generating post ${i} of ${total}...`)
        const res = await fetch(post.mediumUrl)
        const postHtml = await res.text()
        const postMarkdown = convertHtmlToParsedMarkdown(postHtml, post)
        const splitUrl = post.mediumUrl.split('/')
        const mediumName = splitUrl[splitUrl.length-1]
        const newFileName = mediumName.slice(0, mediumName.length-14)
        fs.mkdirSync(`./blog/content/blog/${newFileName}`)
        fs.writeFileSync(`./blog/content/blog/${newFileName}/${newFileName}.md`, postMarkdown)
        ++i
    }
}


generateMarkdownFromPosts()
