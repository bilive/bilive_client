// ==UserScript==
// @name        bilive_client
// @namespace   https://github.com/lzghzr/TampermonkeyJS
// @version     0.0.1
// @author      lzghzr
// @description bilive_client
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       *://passport.bilibili.com/register/verification.html*
// @match       *://github.halaal.win/bilive_client/*
// @match       *://bilive.gitee.io/bilive_client/*
// @match       *://localhost:3000/*
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==

const geetest = {
  validate: '',
  challenge: '',
  seccode: '',
}

if (self !== top && location.hostname === 'passport.bilibili.com') {
  const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'value' && mutation.target instanceof HTMLInputElement)
        if (mutation.target.className === 'geetest_validate')
          geetest.validate = mutation.target.value
        else if (mutation.target.className === 'geetest_challenge')
          geetest.challenge = mutation.target.value
        else if (mutation.target.className === 'geetest_seccode')
          geetest.seccode = mutation.target.value
      if (geetest.validate !== '' && geetest.challenge !== '' && geetest.seccode !== '') {
        top.postMessage(`${geetest.validate}&challenge=${geetest.challenge}&seccode=${encodeURIComponent(geetest.seccode)}`, '*')
        geetest.validate = ''
        geetest.challenge = ''
        geetest.seccode = ''
      }
    })
  })
  bodyObserver.observe(document.body, { attributes: true, subtree: true })
}