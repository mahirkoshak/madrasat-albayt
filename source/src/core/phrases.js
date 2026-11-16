/* Short phrases the apps speak (praise, retry, etc.).
   Pure data: also read by tools/speech_list.js to pre-generate audio clips. */
window.HS_PHRASES = {
  praise: {
    ar: ['أحسنت!', 'ممتاز!', 'رائع!', 'برافو!', 'إجابة صحيحة!'],
    en: ['Great job!', 'Well done!', 'Super!', 'Yes!', 'Amazing!']
  },
  praiseF: { ar: ['أحسنتِ!', 'ممتاز!', 'شاطرة!', 'برافو!', 'رائع!'] },
  retry: { ar: 'حاول مرة ثانية', en: 'Try again' },
  retryF: { ar: 'حاولي مرة ثانية' },
  levelUp: { ar: 'مستوى جديد!', en: 'New level!' },
  levelDown: { ar: 'لنتدرّب أكثر هنا', en: "Let's practice a bit more" },
  combo: { ar: 'سلسلة رائعة!', en: 'On a roll!' }
};
