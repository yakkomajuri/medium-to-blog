# Convert all your Medium posts into a blog in 5 minutes

<img width="1440" alt="Screenshot 2021-03-14 at 20 52 06" src="https://user-images.githubusercontent.com/38760734/111083907-c0275300-8507-11eb-826b-98d6f02eea5c.png">


## How to use

Run the commands below substituting `MEDIUM_URL` and `MEDIUM_USERNAME` for the values applicable to you.

```
git clone https://github.com/yakkomajuri/medium-to-blog
cd medium-to-blog
export MEDIUM_URL=https://yakkomajuri.medium.com MEDIUM_USERNAME=yakkomajuri 
yarn start # or npm start
```

And that's it! You'll get a shiny new Gatsby blog with all your Medium posts in it.

## [Demo](https://www.youtube.com/watch?v=3hk558XEbUs)

## Story

This is a tool that went from idea to its current state _entirely in one Sunday afternoon_. 

I don't really have time to work on it so I hope it works for you if you encounter this repo :D

It has no tests, and I didn't even re-read the code. By the time I was done it was time for dinner.

Things that need to improve:

- [ ] Images
- [ ] Code blocks (should be a matter of making a minor change to the `turndown` dependency)
- [ ] Non-English characters in title
- [ ] Probably a lot of other stuff?






