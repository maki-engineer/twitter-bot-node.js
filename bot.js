'use strict';

// SQLite導入
const sqlite3             = require('sqlite3');
const db                  = new sqlite3.Database('follow.db');

const bot                 = require("./twitter-api-key");           // 百合botのトークンデータ
const api                 = require("./api");                       // Twitter APIデータ
const def                 = require("./function");                  // 関数データ
const morning             = require("./morning");                   // 毎朝紹介する漫画データ
const birthday            = require('./birthday');                  // 誕生日キャラクターデータ
const manga_introduction  = require('./manga-introduction');        // 紹介する漫画データ
const this_week_manga     = require("./this-week-manga");           // 今週発売される漫画データ
const count_manga         = require("./count-manga");               // 漫画カウントダウンデータ
const not_favo_and_ret    = require("./not-favorite-and-retweet");  // ふぁぼりつする機能のデータ
const hashtag             = require("./hashtag");                   // ハッシュタグのデータ
const timeline            = require("./timeline");                  // 特定のユーザーのタイムラインのデータ
const reply_recommend     = require("./reply-recommend");           // 返信するのに必要なデータ１
const reply_introduction  = require("./reply-introduction");        // 返信するのに必要なデータ２

const { post }            = require('request');
const { nextTick }        = require('process');
const { clearScreenDown } = require('readline');

// 変数設定
let img;                            // 投稿する画像
let text;                           // ツイート文
let replyText;                      // 返信文
let number_of_people_followed = 0;  // フォローした人数

// 投稿・ふぁぼりつ・フォローなどをする機能
{
  setInterval(function() {
    
    // 日付設定
    let today       = new Date();
    let today_year  = today.getFullYear();
    let today_month = today.getMonth() + 1;
    let today_date  = today.getDate();
    let today_day   = today.getDay();
    let today_hour  = today.getHours();
    let today_min   = today.getMinutes();

    // フォロー人数
    let follow = 0;

    {  // 投稿する機能
      {  // 挨拶ツイ
        if(morning.bool){
          try{
            img  = require('fs').readFileSync(morning.recommended[1]);
            text = morning.good_morning;
            bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res) {
              if(err) {
                console.log(err);
              }else{
                bot.lilyBot.post(api.createTweet, {status: text, media_ids: img.media_id_string}, function(err, tweet, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                  }
                });
              }
            });

            morning.bool = false;

            // ４秒後にキャラの誕生日を祝う
            for(let characterBirthDay of birthday.characters){
              if(today_month === characterBirthDay.month && today_date === characterBirthDay.date){
                birthday.today.push(characterBirthDay);
              }
            }
          
            if(birthday.today.length === 0){
              return;
            }else if(birthday.today.length === 1){
              setTimeout(() => {
                img  = require('fs').readFileSync(birthday.today[birthday.number_of_people].img);
                bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res){
                  if(err){
                    console.log(err);
                  }else{
                    bot.lilyBot.post(api.createTweet, {status: "そして、今日は" + birthday.today[birthday.number_of_people].title + "の作品の" + birthday.today[birthday.number_of_people].name + "の誕生日です！\nおめでとうございます♪\n\n" + birthday.today[birthday.number_of_people].hashtag, media_ids: img.media_id_string}, function(err, tweet, res){
                      console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                    });
                  }
                });
              }, 4_000);
            }else{
              let birthdayTimer = setInterval(function(){
                if(birthday.number_of_people === birthday.today.length){
                  clearInterval(birthdayTimer);
                }else if(birthday.number_of_people === 0){
                  img  = require('fs').readFileSync(birthday.today[birthday.number_of_people].img);
                  bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res){
                    if(err){
                      console.log(err);
                    }else{
                      bot.lilyBot.post(api.createTweet, {status: "そして、今日は" + birthday.today[birthday.number_of_people].title + "の作品の" + birthday.today[birthday.number_of_people].name + "の誕生日です！\nおめでとうございます♪\n\n" + birthday.today[birthday.number_of_people].hashtag, media_ids: img.media_id_string}, function(err, tweet, res){
                        console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                        birthday.number_of_people++;
                      });
                    }
                  });
                }else{
                  img  = require('fs').readFileSync(birthday.today[birthday.number_of_people].img);
                  bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res){
                    if(err){
                      console.log(err);
                    }else{
                      if(birthday.today[birthday.number_of_people].title === birthday.today[birthday.number_of_people - 1].title){
                        bot.lilyBot.post(api.createTweet, {status: "さらに！ 同じ作品の" + birthday.today[birthday.number_of_people].name + "の誕生日でもあります！\nおめでとうございます♪\n\n" + birthday.today[birthday.number_of_people].hashtag, media_ids: img.media_id_string}, function(err, tweet, res){
                          console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                          birthday.number_of_people++;
                        });
                      }else{
                        bot.lilyBot.post(api.createTweet, {status: "さらに！" + birthday.today[birthday.number_of_people].title + "の作品の" + birthday.today[birthday.number_of_people].name + "の誕生日でもあります！\nおめでとうございます♪\n\n" + birthday.today[birthday.number_of_people].hashtag, media_ids: img.media_id_string}, function(err, tweet, res){
                          console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                          birthday.number_of_people++;
                        });
                      }
                    }
                  });
                }
              } , 4_000);
            }
          }catch{
            console.log("\n\nAn unexpected error has occurred.\n\n");
          }
        }
      }

      {  // 漫画紹介文
        if((today_hour > 8) && (today_hour < 21)){
          if(today_min === 20){
            try{
              text = manga_introduction.data[manga_introduction.count][0];
              img  = require('fs').readFileSync(manga_introduction.data[manga_introduction.count][1]);
              bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res) {
                if(err) {
                  console.log(err);
                }else{
                  bot.lilyBot.post(api.createTweet, {status: text, media_ids: img.media_id_string}, function(err, tweet, res) {
                    if(err) {
                      console.log(err);
                    }else{
                      console.log("\n漫画紹介をツイートしました！");
                    }
                  });
                }
              });
            }catch{
              console.log("\n\nAn unexpected error has occurred.\n\n");
            }
            manga_introduction.count++;
          }
        }
      }
      
      {  // １２時にツイート
        if(today_hour === 12 && today_min === 0){
          if(today_day === 1){        // 月曜日
            try{
              let thisWeekLilyMangas = count_manga.data.filter(function(value){  // 今週発売の百合作品抽出
  
                if(today_date <= this_week_manga.endOfThisDate - 7){  // 月をまたがっていない場合
                  return (value[2] >= today_date) && (value[2] < this_week_manga.sevenDaysLater);
                }else{                                                // 月をまたがっている場合
                  return (value[2] >= today_date) || (value[2] < this_week_manga.sevenDaysLater);
                }
  
              });
  
              if(thisWeekLilyMangas.length > 0){            // 今週に何か発売される場合はツイート
                let thisWeekLilyManga = [];
  
                for(let mangaTitle of thisWeekLilyMangas){  // thisWeekLilyMangaに格納
                  thisWeekLilyManga.push(mangaTitle[5]);
                }
  
                text = "今週発売される百合作品は\n" + thisWeekLilyManga.join("") + "\n\nです！お楽しみに♪";
                bot.lilyBot.post(api.createTweet, {status: text}, function(err, tweet, res){
                  if(err){                                  // 140文字超えちゃったら
                    let halfmangas1 = [];
                    let halfmangas2 = [];
                    let halfIndex1 = 0;
                    let halfIndex2 = 0;

                    if(thisWeekLilyManga.length % 2 === 0){
                      halfIndex1 = Math.floor(thisWeekLilyManga.length / 2);
                      halfIndex2 = thisWeekLilyManga.length - halfIndex1 + 1;
                    }else{
                      halfIndex1  = Math.floor(thisWeekLilyManga.length / 2);
                      halfIndex2  = thisWeekLilyManga.length - halfIndex1;
                    }

                    for(let i = 0; i <= halfIndex1; i++){
                      halfmangas1.push(thisWeekLilyManga[i]);
                    }

                    for(let i = halfIndex2; i < thisWeekLilyManga.length; i++){
                      halfmangas2.push(thisWeekLilyManga[i]);
                    }

                    let text1 = "今週発売される百合作品は\n" + halfmangas1.join("");
                    let text2 = halfmangas2.join("") + "\n\nです！お楽しみに♪";

                    setTimeout(() => {
                      bot.lilyBot.post(api.createTweet, {status: text1}, function(err, tweet1, res){
                        setTimeout(() => {
                          bot.lilyBot.post(api.createTweet, {status: text2, in_reply_to_status_id: tweet1.id_str}, function(err, tweet2, res){
                            console.log("\n下記の内容をツイートしました！\n\n" + tweet1.text + tweet2.text);
                          });
                        }, 4_000);
                      });
                    }, 4_000);
                  }else{
                    console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                  }
                });
              }
            }catch{
              console.log("\n\nAn unexpected error has occurred.\n\n");
            }
          }else if(today_day === 3){  // 水曜日
            try{
              text = "百合を愛する全ての方におすすめしたいカフェ【百合カフェanchor】\n\n新宿三丁目にあるカフェで、1,000冊以上の百合作品を読むことが出来ます。是非一度足を運んでみてください♪\n\n百合カフェanchorさんのアカウントはこちら→(@anchor_staff) #百合カフェanchor";
              img  = require('fs').readFileSync("img/anchor.jpg");
              bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res) {
                if(err) {
                  console.log(err);
                }else{
                  bot.lilyBot.post(api.createTweet, {status: text, media_ids: img.media_id_string}, function(err, tweet, res) {
                    if(err) {
                      console.log(err);
                    }else{
                      console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                    }
                  });
                }
              });
            }catch{
              console.log("\n\nAn unexpected error has occurred.\n\n");
            }
          }else if(today_day === 5){  // 金曜日
            try{
              text = "こちらは【とある百合サイト】です！\n\n・百合botを作成したまき(@MKRKL)が今まで読んできた百合作品を紹介した百合漫画サイトがあります。\n\n・百合作品をクイズ形式で楽しめる百合センター試験サイトがあります。\n\nお時間がある時に覗いてみてください♪\nhttps://mysite2-e2145.web.app/";
              bot.lilyBot.post(api.createTweet, {status: text}, function(err, tweet, res){
                console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
              });
            }catch{
              console.log("\n\nAn unexpected error has occurred.\n\n");
            }
          }
        }
      }
      
      {  // カウントダウンをする
        if(count_manga.countManga_index < count_manga.data.length){

          if(today_min === count_manga.mins[count_manga.min_index]){

            try{

              if(def.timeCount(count_manga.data[count_manga.countManga_index][0], count_manga.data[count_manga.countManga_index][1], count_manga.data[count_manga.countManga_index][2]) % 7 === 0){

                if(def.timeCount(count_manga.data[count_manga.countManga_index][0], count_manga.data[count_manga.countManga_index][1], count_manga.data[count_manga.countManga_index][2]) === 0){

                  bot.lilyBot.post(api.createTweet, {status: count_manga.data[count_manga.countManga_index][3]}, function(err, tweet, res){
                    if(err){
                      console.log(err);
                    }else{
                      console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                    }
                  });

                }else{

                  bot.lilyBot.post(api.createTweet, {status: count_manga.data[count_manga.countManga_index][4] + "後" + Math.floor(def.timeCount(count_manga.data[count_manga.countManga_index][0], count_manga.data[count_manga.countManga_index][1], count_manga.data[count_manga.countManga_index][2]) / 7) + "週間です！" + count_manga.data[count_manga.countManga_index][5] + count_manga.data[count_manga.countManga_index][6]}, function(err, tweet, res){
                    if(err){
                      console.log(err);
                    }else{
                      console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                    }
                  });

                }
              }
  
              // count_manga.mins配列操作
              if(count_manga.min_index === 3){
                count_manga.min_index = 0;
              }else{
                count_manga.min_index++;
              }
            }catch{
              console.log("\n\nAn unexpected error has occurred.\n\n");
            }
            count_manga.countManga_index++;
          }
        }
      }
    }

    {  // ふぁぼりつする機能
      {  // ハッシュタグツイをふぁぼりつする
        if(today_min % 5 === 0){  // ５分ごと
          if(hashtag.count === hashtag.data.length){
            hashtag.data  = def.shuffle(hashtag.data);
            hashtag.count = 0;
            bot.lilyBot.get(api.searchTweet, hashtag.data[hashtag.count], function(err, search, res) {
              if(search){
                for(let searches of search.statuses) {
                  if(searches.text.startsWith("RT") === true){  // リツイートしているツイートは無視
                    continue;
                  }else{
                    bot.lilyBot.get("statuses/lookup", {id: searches.id_str}, function(err, tweets, res){
                      if(tweets){
                        for(let tweet of tweets){
                          if(tweet.retweeted === true){
                            continue;
                          }else{
                            if(tweet.in_reply_to_status_id !== null){  // リプは飛ばす
                              continue;
                            }else{
                              if(not_favo_and_ret.data.includes(tweet.user.id_str)){  // 特定ユーザーは飛ばす
                                continue;
                              }else{
                                bot.lilyBot.post(api.createFavorite, {id: tweet.id_str}, function(err, favo, res) {
                                  if(err) {
                                    console.log(err);
                                  }else{
                                    console.log('\n' + favo.user.name + "さんのツイートにいいねしました！");
                                  };
                                });
                                bot.lilyBot.post(api.createRetweet, {id: tweet.id_str}, function(err, favo, res) {
                                  if(err) {
                                    console.log(err);
                                  }else{
                                    console.log('\n' + favo.retweeted_status.user.name + 'さんのツイートをリツイートしました！');
                                  };
                                });
                              }
                            }
                          }
                        }
                      }
                    });
                  }
                }
              }
            });
            hashtag.count++;
          }else{
            bot.lilyBot.get(api.searchTweet, hashtag.data[hashtag.count], function(err, search, res) {
              if(search){
                for(let searches of search.statuses) {
                  if(searches.text.startsWith("RT") === true){  // リツイートしているツイートは無視
                    continue;
                  }else{
                    bot.lilyBot.get("statuses/lookup", {id: searches.id_str}, function(err, tweets, res){
                      if(tweets){
                        for(let tweet of tweets){
                          if(tweet.retweeted === true){
                            continue;
                          }else{
                            if(tweet.in_reply_to_status_id !== null){  // リプは飛ばす
                              continue;
                            }else{
                              if(not_favo_and_ret.data.includes(tweet.user.id_str)){  // 特定ユーザーは飛ばす
                                continue;
                              }else{
                                bot.lilyBot.post(api.createFavorite, {id: tweet.id_str}, function(err, favo, res) {
                                  if(err) {
                                    console.log(err);
                                  }else{
                                    console.log('\n' + favo.user.name + "さんのツイートにいいねしました！");
                                  };
                                });
                                bot.lilyBot.post(api.createRetweet, {id: tweet.id_str}, function(err, favo, res) {
                                  if(err) {
                                    console.log(err);
                                  }else{
                                    console.log('\n' + favo.retweeted_status.user.name + 'さんのツイートをリツイートしました！');
                                  };
                                });
                              }
                            }
                          }
                        }
                      }
                    });
                  }
                }
              }
            });
            hashtag.count++;
          }
        }
      }

      {  // 他人のタイムラインをふぁぼりつする機能
        if(today_min % 5 === 0){  // ５分ごと
          if(timeline.count === timeline.data.length){
            timeline.data = def.shuffle(timeline.data);
            timeline.count      = 0;
            bot.lilyBot.get(api.getTimeline, timeline.data[timeline.count], function(error, search, res) {
              if(search){
                for(let timeline of search) {
                  if(timeline.retweeted === true) {
                    continue;
                  }else{
                    if(timeline.in_reply_to_status_id !== null) {
                      continue;
                    }else{
                      if(timeline.text.startsWith("RT") === true){  // リツイートしたツイートなら、百合botのツイートだけは何もしないようにする
                        if(timeline.retweeted_status.user.id_str === "1299272312156372994"){
                          continue;
                        }else{
                          bot.lilyBot.post(api.createFavorite, {id: timeline.id_str}, function(err, favo, res) {
                            if(err) {
                              console.log(err);
                            }else{
                              console.log('\n' + favo.user.name + 'さんのツイートにいいねしました！');
                            };
                          });
                          bot.lilyBot.post(api.createRetweet, {id: timeline.id_str}, function(err, favo, res) {
                            if(err) {
                              console.log(err);
                            }else{
                              console.log('\n' + favo.retweeted_status.user.name + 'さんのツイートをリツイートしました！');
                            }
                          });
                        }
                      }else{
                        bot.lilyBot.post(api.createFavorite, {id: timeline.id_str}, function(err, favo, res) {
                          if(err) {
                            console.log(err);
                          }else{
                            console.log('\n' + favo.user.name + 'さんのツイートにいいねしました！');
                          };
                        });
                        bot.lilyBot.post(api.createRetweet, {id: timeline.id_str}, function(err, favo, res) {
                          if(err) {
                            console.log(err);
                          }else{
                            console.log('\n' + favo.retweeted_status.user.name + 'さんのツイートをリツイートしました！');
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
            timeline.count++;
          }else{
            bot.lilyBot.get(api.getTimeline, timeline.data[timeline.count], function(error, search, res) {
              if(search){
                for(let timeline of search) {
                  if(timeline.retweeted === true) {
                    continue;
                  }else{
                    if(timeline.in_reply_to_status_id !== null) {
                      continue;
                    }else{
                      if(timeline.text.startsWith("RT") === true){  // リツイートしたツイートなら、百合botのツイートだけは何もしないようにする
                        if(timeline.retweeted_status.user.id_str === "1299272312156372994"){
                          continue;
                        }else{
                          bot.lilyBot.post(api.createFavorite, {id: timeline.id_str}, function(err, favo, res) {
                            if(err) {
                              console.log(err);
                            }else{
                              console.log('\n' + favo.user.name + 'さんのツイートにいいねしました！');
                            };
                          });
                          bot.lilyBot.post(api.createRetweet, {id: timeline.id_str}, function(err, favo, res) {
                            if(err) {
                              console.log(err);
                            }else{
                              console.log('\n' + favo.retweeted_status.user.name + 'さんのツイートをリツイートしました！');
                            }
                          });
                        }
                      }else{
                        bot.lilyBot.post(api.createFavorite, {id: timeline.id_str}, function(err, favo, res) {
                          if(err) {
                            console.log(err);
                          }else{
                            console.log('\n' + favo.user.name + 'さんのツイートにいいねしました！');
                          };
                        });
                        bot.lilyBot.post(api.createRetweet, {id: timeline.id_str}, function(err, favo, res) {
                          if(err) {
                            console.log(err);
                          }else{
                            console.log('\n' + favo.retweeted_status.user.name + 'さんのツイートをリツイートしました！');
                          }
                        });
                      }
                    }
                  }
                }
              }
            });
            timeline.count++;
          }
        }
      }
    }

    {  // フォローしてくれた人をフォローする機能
      if(today_min % 15 === 0){  // １５分ごと
        try{
          bot.lilyBot.get(api.followerList, api.maki_lily_bot, function(err, list, res) {
            if(err){
              console.log(err);
            }else{
              if(list){
                if(list.users){
                  for(let followers of list.users) {
                    if(followers.muting) {
                      continue;
                    }else{
                      if(followers.follow_request_sent) {  // すでに百合botが鍵垢にリクエストを送っていたら無視
                        continue;
                      }else {
                        if(followers.following){
                          bot.lilyBot.post(api.createTweet, {status: "@" + followers.screen_name + " " + followers.name + "さん、百合botをフォローして頂き、ありがとうございます♪\n最新の百合情報を提供したり、百合作品を紹介したりしています。\nあなたのお役に立つことが出来たらすごく嬉しいです。\nこれからもよろしくお願いします！"}, function(error, reply, res) {
                            if(error) {
                              console.log(error);
                            }
                          });
                          bot.lilyBot.post(api.createMute, {user_id: followers.id_str}, function(err, mute, res) {
                            if(err) {
                              console.log(err);
                            }else{
                              console.log('\n' + followers.name + "さんをミュートしました！")
                            }
                          });
                          db.run(`delete from followslist where name = ?`, followers.screen_name);
                          if(number_of_people_followed !== 0){
                            number_of_people_followed--;
                          }
                        }else{
                          bot.lilyBot.post(api.createFollow, {user_id: followers.id_str}, function(err, follow, res) {
                            if(err) {
                              console.log(err);
                            }else{
                              console.log('\n' + followers.name + "さんからフォローされました！");
                            }
                          });
                          bot.lilyBot.post(api.createTweet, {status: "@" + followers.screen_name + " " + followers.name + "さん、百合botをフォローして頂き、ありがとうございます♪\n最新の百合情報を提供したり、百合作品を紹介したりしています。\nあなたのお役に立つことが出来たらすごく嬉しいです。\nこれからもよろしくお願いします！"}, function(error, reply, res) {
                            if(error) {
                              console.log(error);
                            }
                          });
                          bot.lilyBot.post(api.createMute, {user_id: followers.id_str}, function(err, mute, res) {
                            if(err) {
                              console.log(err);
                            }
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          });
        }catch{
          console.log("\n\nAn unexpected error has occurred.\n\n");
        }
      }
    }

    {  // 自分からフォローする機能
      if(today_min === 10){         // 百合好きさんと繋がりたいのハッシュタグツイした人をフォロー
        db.all('select * from followslist', (err, rows) => {
          if(err){
            console.log(err);
            return;
          }else{
            if(rows.length >= 90){
              return;
            }else{
              bot.lilyBot.get(api.searchTweet, {q: "#百合好きさんと繋がりたい", count: 150}, function(err, users, res) {
                if(err){
                  console.log(err);
                }else{
                  if(users){
                    for(let user of users.statuses){
                      if(user.in_reply_to_status_id){
                        continue;
                      }else{
                        if(user.text.startsWith("RT")){
                          continue;
                        }else{
                          if(user.user.screen_name === "maki_lily_bot"){
                            continue;
                          }else{
                            if(user.user.following){
                              continue;
                            }else{
                              if(user.user.protected){
                                continue;
                              }else{
                                if(user.user.friends_count / user.user.followers_count >= 1){
                                  db.all("select * from muteusers", (err, rows) => {
                                    const check = rows.some(b => b.name === user.user.screen_name);
                                    if(check === false){
                                      if(number_of_people_followed < 6){
                                        if(follow === 2){
                                          return;
                                        }else{
                                          follow++;
                                          number_of_people_followed++;
                                          bot.lilyBot.post(api.createFollow, {screen_name: user.user.screen_name}, function(err, follow, res){
                                            console.log('\n特定のハッシュタグツイをした' + user.user.name + "さんをフォローしました！");
                                          });
                                          db.run(`insert into followslist(name, month, date, year) values(?, ?, ?, ?)`, user.user.screen_name, today_month, today_date, today_year, (err) => {
                                            if(err){
                                              return;
                                            }
                                          });
                                          if(user.retweeted === false){
                                            bot.lilyBot.post(api.createFavorite, {id: user.id_str}, function(err, favo, res) {
                                              if(err) {
                                                console.log(err);
                                              }
                                            });
                                            bot.lilyBot.post(api.createRetweet, {id: user.id_str}, function(err, favo, res) {
                                              if(err) {
                                                console.log(err);
                                              }
                                            });
                                          }
                                        }
                                      }
                                    }
                                  });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              });
            }
          }
        });
      }else if(today_min === 25){   // 百合ナビのフォロワーをフォロー
        db.all("select * from followslist", (err, rows) => {
          if(err){
            return;
          }else{
            if(rows.length >= 90){
              return;
            }else{
              bot.lilyBot.get(api.followerList, {user_id: '749179181741645824', count: 200, skip_status: true, include_user_entities: false}, function(err, followers, res) {
                if(err){
                  console.log(err);
                }else{
                  for(let follower of followers.users){
                    if(follower.muting === false){
                      if(follower.following === false){
                        if(follower.protected === false){
                          if(follower.friends_count / follower.followers_count >= 1){
                            if(number_of_people_followed < 6){
                              if(follow === 2){
                                return;
                              }else{
                                follow++;
                                number_of_people_followed++;
                                bot.lilyBot.post(api.createFollow, {screen_name: follower.screen_name}, function(err, follow, res){
                                  console.log('\n百合ナビのフォロワーの' + follower.name + "さんをフォローしました！");
                                });
                                db.run(`insert into followslist(name, month, date, year) values(?, ?, ?, ?)`, follower.screen_name, today_month, today_date, today_year, (err) => {
                                  if(err){
                                    return;
                                  }
                                });
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              });
            }
          }
        });
      }else if(today_min === 40){   // リストのメンバーをフォロー
        db.all("select * from followslist", (err, rows) => {
          if(err){
            return;
          }else{
            if(rows.length >= 90){
              return;
            }else{
              bot.lilyBot.get(api.listMember, /*百合の民*/{list_id: "1267302911144419329", count: 5000}, function(err, members, res){
                for(let member of members.users){
                  if(member.screen_name !== "maki_lily_bot"){
                    if(member.following === false){
                      if(member.protected === false){
                        if(member.friends_count / member.followers_count >= 1){
                          db.all("select * from muteusers", (err, rows) => {
                            const check = rows.some(b => b.name === member.screen_name);
                            if(check === false){
                              if(number_of_people_followed < 6){
                                if(follow === 2){
                                  return;
                                }else{
                                  follow++;
                                  number_of_people_followed++;
                                  bot.lilyBot.post(api.createFollow, {screen_name: member.screen_name}, function(err, follow, res){
                                    console.log('\nリストメンバーの' + member.name + "さんをフォローしました！");
                                  });
                                  db.run(`insert into followslist(name, month, date, year) values(?, ?, ?, ?)`, member.screen_name, today_month, today_date, today_year, (err) => {
                                    if(err){
                                      return;
                                    }
                                  });
                                }
                              }
                            }
                          });
                        }
                      }
                    }
                  }
                }
              });
            }
          }
        });
      }
    }

    {  // フォロー解除する機能
      // 百合botの方からフォローした人が１５日経ってもフォロー返してくれてなかったらフォロー解除
      if(today_hour === 9){
        if((today_min === 5) || (today_min === 20) || (today_min === 35)){
          db.all('select * from followslist limit ?', 2, (err, rows) => {
            if(err){
              console.log(err);
              return;
            }else{
              if(rows.length > 0){
                rows.forEach((row) =>{
                  if(def.daysElapsed(row.year, row.month, row.date) >= 15){
                    bot.lilyBot.post(api.createMute, {screen_name: row.name}, function(err, mute, res) {
                      if(err) {
                        console.log(err);
                      }
                    });
                    bot.lilyBot.post(api.liftFollow, {screen_name: row.name}, function(err, unfol, res){
                      if(err){
                        console.log(err);
                      }else{
                        console.log('\n' + unfol.name + "さんをミュートしてフォロー解除しました！");
                      }
                    });
                    db.run('delete from followslist where name = ?', row.name, (err) =>{
                      if(err){
                        return;
                      }
                    });
                    db.run("insert into muteusers(name) values(?)", row.name, (err) => {
                      if(err){
                        return;
                      }
                    });
                  }
                });
              }
            }
          });
        }
      }

      // 百合botのことをフォロー解除した人のことをフォロー解除
      if(today_min % 15 === 0){
        db.all("select * from followNextcursor", (err, rows) => {
          if(rows[0].bool === 0){
            bot.lilyBot.get(api.followList, api.maki_lily_bot, function(err, follows, res){
              db.all("select name from followslist", (err, alreadyfollows) => {
                // テーブルのscreen_nameだけを配列にする
                let alreadyfollowsAry = alreadyfollows.map(obj => obj.name);
          
                // 自分からフォローしたアカウントを排除した配列
                let liftFollowusers = follows.users.filter((value) => {return ! alreadyfollowsAry.includes(value.screen_name);});
                
                // screen_nameだけを取って配列にする ２０人ずつ関係性を調べる
                let relationshipUsers = liftFollowusers.map(obj => obj.screen_name);
                
                // ２０個ずつ分割
                relationshipUsers = def.sliceByNumber(relationshipUsers, 20);
          
                // 分割した個数分関係性を調べる
                for(let relationshipUser of relationshipUsers){
                  // 配列の文字列を結合
                  let liftUsers = relationshipUser.join();
                  
                  // 関係性を調べる
                  bot.lilyBot.get(api.searchRelationship, {screen_name: liftUsers}, function(err, relationships, res) {
                    if(err){
                      console.log(err);
                    }else{
                      if(relationships){
                        if(relationships.length >= 1){
                          for(let relationship of relationships){
                            if(relationship.connections.includes("followed_by") === false){
                              bot.lilyBot.post(api.liftFollow, {screen_name: relationship.screen_name}, function(err, unfol, res){
                                if(err){
                                  console.log(err);
                                }else{
                                  console.log('\nフォロー解除した' + unfol.name + "さんをフォロー解除しました！");
                                }
                              });
                
                              db.run("insert into muteusers(name) values(?)", relationship.screen_name, (err) => {
                                if(err){
                                  return;
                                }
                              });
                            }
                          }
                        }
                      }
                    }
                  });
                }
              });
          
              db.run("update followNextcursor set cursor = ?, bool = ?", follows.next_cursor_str, 1);
            });
          }else{
            bot.lilyBot.get(api.followList, {screen_name: "maki_lily_bot", cursor: rows[0].cursor, count: 200}, function(err, follows, res){
              db.all("select name from followslist", (err, alreadyfollows) => {
                // テーブルのscreen_nameだけを配列にする
                let alreadyfollowsAry = alreadyfollows.map(obj => obj.name);
          
                // 自分からフォローしたアカウントを排除した配列
                let liftFollowusers = follows.users.filter((value) => {return ! alreadyfollowsAry.includes(value.screen_name);});
                
                // screen_nameだけを取って配列にする ２０人ずつ関係性を調べる
                let relationshipUsers = liftFollowusers.map(obj => obj.screen_name);
                
                // ２０個ずつ分割
                relationshipUsers = def.sliceByNumber(relationshipUsers, 20);
          
                // 分割した個数分関係性を調べる
                for(let relationshipUser of relationshipUsers){
                  // 配列の文字列を結合
                  let liftUsers = relationshipUser.join();
                  
                  // 関係性を調べる
                  bot.lilyBot.get(api.searchRelationship, {screen_name: liftUsers}, function(err, relationships, res) {
                    if(err){
                      console.log(err);
                    }else{
                      if(relationships){
                        if(relationships.length >= 1){
                          for(let relationship of relationships){
                            if(relationship.connections.includes("followed_by") === false){
                              bot.lilyBot.post(api.liftFollow, {screen_name: relationship.screen_name}, function(err, unfol, res){
                                if(err){
                                  console.log(err);
                                }else{
                                  console.log('\nフォロー解除した' + unfol.name + "さんをフォロー解除しました！");
                                }
                              });
                
                              db.run("insert into muteusers(name) values(?)", relationship.screen_name, (err) => {
                                if(err){
                                  return;
                                }
                              });
                            }
                          }
                        }
                      }
                    }
                  });
                }
              });
          
              try{
                // 最後までフォロー一覧を見終わったらまた最初から見れるように
                if(follows.next_cursor_str === "0"){
                  db.run("update followNextcursor set bool = ?", 0);
                }else{
                  db.run("update followNextcursor set cursor = ?", follows.next_cursor_str);
                }
              }catch{
                db.run("update followNextcursor set bool = ?", 0);
              }
            });
          }
        });
      }
    }
  
  }, 60_000);  // １分ごとに機能している
}

// 返信機能
{
  setInterval(() => {

    bot.lilyBot.get(api.replyList, {count: 1}, function(err, mention, res) {
      if(mention){
        if(mention[0]){
          // すでにいいねしていたら返信不要
          if(mention[0].favorited === true) {
            return;
          }else{
            // 巻き込みリプは無視する
            if(mention[0].entities.user_mentions.length === 1){
              // startsWithメソッドが使えるように配列で分ける
              replyText = mention[0].text.split(" ");

              // 紹介している漫画を含んだリプライならその漫画を紹介していいねする
              for(let lily_introduction in reply_introduction.data){
                if(replyText[1].startsWith(lily_introduction)){
                  img = require('fs').readFileSync(reply_introduction.data[lily_introduction][1]);
                  bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res) {
                    if(err) {
                      console.log(err);
                    }else{
                      bot.lilyBot.post(api.createTweet, {status: "@" + mention[0].user.screen_name + " " + reply_introduction.data[lily_introduction][0], in_reply_to_status_id: mention[0].id_str, media_ids: img.media_id_string}, function(err, tweet, res) {
                        if(err) {
                          console.log(err);
                        }else{
                          console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                        }
                      });
                    }
                  });
                }
              }
              if(mention[0].text.search('おや') !== -1) {
                // あいさつしてくれたらあいさつし返していいねする
                bot.lilyBot.post(api.createTweet, {status: "@" + mention[0].user.screen_name + " " + mention[0].user.name + "さん、おや百合なさい♪", in_reply_to_status_id: mention[0].id_str}, function(err, reply, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log("\n下記の内容をツイートしました！\n\n" + reply.text);
                  };
                });
                bot.lilyBot.post(api.createFavorite, {id: mention[0].id_str}, function(err, favo, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log('\nこの内容にいいねしました！\n\n' + mention[0].text);
                  };
                });
              }else if(mention[0].text.search('おは') !== -1) {
                // あいさつしてくれたらあいさつし返していいねする
                bot.lilyBot.post(api.createTweet, {status: "@" + mention[0].user.screen_name + " " + mention[0].user.name + "さん、おは百合です♪", in_reply_to_status_id: mention[0].id_str}, function(err, reply, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log("\n下記の内容をツイートしました！\n\n" + reply.text);
                  };
                });
                bot.lilyBot.post(api.createFavorite, {id: mention[0].id_str}, function(err, favo, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log('\nこの内容にいいねしました！\n\n' + mention[0].text);
                  };
                });
              }else if((replyText[1].startsWith("ヘルプ")) || (replyText[1].startsWith("へるぷ")) || (replyText[1].startsWith("Help")) || (replyText[1].startsWith("help"))) {
                // ヘルプ系のリプライなら百合botの機能について説明していいねする
                bot.lilyBot.post(api.createTweet, {status: "@" + mention[0].user.screen_name + " ・百合bot宛てに「おすすめ」などと呟いて頂けたら、まきが今まで読んできた百合作品を紹介します！\n\n・百合bot宛てに百合作品の作品名を含めて呟いて頂けたら、その作品について紹介します！", in_reply_to_status_id: mention[0].id_str}, function(err, reply, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log("\n下記の内容をツイートしました！\n\n" + reply.text);
                  };
                });
                bot.lilyBot.post(api.createFavorite, {id: mention[0].id_str}, function(err, favo, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log('\nこの内容にいいねしました！\n\n' + mention[0].text);
                  };
                });
              }else if((replyText[1].startsWith('おすすめ')) || (replyText[1].startsWith("オススメ"))) {
                // おすすめを含んだリプライならおすすめの漫画を紹介していいねする
                reply_recommend.recommend = reply_recommend.data[Math.floor(Math.random() * reply_recommend.data.length)];
                img = require('fs').readFileSync(reply_recommend.recommend[1]);
                bot.lilyBot.post(api.acquisitionImage, {media: img}, function(err, img, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    bot.lilyBot.post(api.createTweet, {status: "@" + mention[0].user.screen_name + " " + reply_recommend.recommend[0], in_reply_to_status_id: mention[0].id_str, media_ids: img.media_id_string}, function(err, tweet, res) {
                      if(err) {
                        console.log(err);
                      }else{
                        console.log("\n下記の内容をツイートしました！\n\n" + tweet.text);
                      }
                    });
                  }
                });
                bot.lilyBot.post(api.createFavorite, {id: mention[0].id_str}, function(err, favo, res) {
                  console.log("\nこの内容にいいねしました！\n\n" + mention[0].text);
                });
              }else{
                // いいねだけをする
                bot.lilyBot.post(api.createFavorite, {id: mention[0].id_str}, function(err, favo, res) {
                  if(err) {
                    console.log(err);
                  }else{
                    console.log('\nこの内容にいいねしました！\n\n' + mention[0].text);
                  };
                });
              }
            }
          }
        }
      }
    });

  }, 15_000);  // １５秒ごとに機能している
}

