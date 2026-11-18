/* ============================================================
   KIDS' DICTIONARY – word list (English, CEFR A1–A2)
   One word per line:  word | part of speech | emoji | Arabic meaning | simple English definition | example sentence | difficulty | topic
   - difficulty: 3 = easy, 4 = medium, 5 = hard
   - topic: one of the keys in TOPICS below
   - definitions are "student-friendly": everyday words, one short sentence (Beck & McKeown)
   To add a word: add one line anywhere (keep the 8 parts). The id is the word itself, so don't rename a word.
   ============================================================ */
APPDATA.dict = {};
APPDATA.dict.TOPICS = {
  fam: ['👨‍👩‍👧', 'Family & people', 'العائلة والناس'],
  body: ['🫀', 'Body & health', 'الجسم والصحة'],
  food: ['🍎', 'Food & drinks', 'الطعام والشراب'],
  ani: ['🐾', 'Animals', 'الحيوانات'],
  home: ['🏠', 'Home', 'البيت'],
  sch: ['🏫', 'School', 'المدرسة'],
  town: ['🏙️', 'Places', 'الأماكن'],
  job: ['👩‍⚕️', 'Jobs', 'المهن'],
  trans: ['🚗', 'Transport', 'المواصلات'],
  nat: ['🌦️', 'Nature & weather', 'الطبيعة والطقس'],
  time: ['⏰', 'Time', 'الوقت'],
  sport: ['⚽', 'Sports & hobbies', 'الرياضة والهوايات'],
  clo: ['👕', 'Clothes', 'الملابس'],
  feel: ['😊', 'Feelings & describing', 'المشاعر والصفات'],
  act: ['🏃', 'Action words', 'أفعال'],
  sci: ['🔭', 'Science & space', 'العلوم والفضاء'],
  col: ['🎨', 'Colors & shapes', 'الألوان والأشكال'],
  num: ['🔢', 'Numbers & math', 'الأرقام والرياضيات'],
  life: ['🕌', 'Faith & daily life', 'الدين والحياة اليومية']
};
APPDATA.dict.POS = { n: ['noun', 'اسم'], v: ['verb', 'فعل'], adj: ['adjective', 'صفة'], adv: ['adverb', 'ظرف'], prep: ['preposition', 'حرف جر'] };
APPDATA.dict.RAW = `
mother|n|👩|أم|A woman who has children.|My mother makes breakfast every morning.|3|fam
father|n|👨|أب|A man who has children.|My father drives me to school.|3|fam
brother|n|👦|أخ|A boy who has the same parents as you.|My brother is ten years old.|3|fam
sister|n|👧|أخت|A girl who has the same parents as you.|My sister likes to draw.|3|fam
baby|n|👶|طفل رضيع|A very young child.|The baby is sleeping.|3|fam
grandmother|n|👵|جدة|The mother of your mother or father.|I visit my grandmother on Friday.|3|fam
grandfather|n|👴|جد|The father of your mother or father.|My grandfather tells funny stories.|3|fam
family|n|👨‍👩‍👧‍👦|عائلة|A group of people like parents and their children.|My family eats dinner together.|3|fam
friend|n|🧑‍🤝‍🧑|صديق|A person you like and play with.|Ali is my best friend.|3|fam
uncle|n|🧔|عم / خال|The brother of your mother or father.|My uncle has a big farm.|4|fam
aunt|n|👩‍🦱|عمة / خالة|The sister of your mother or father.|My aunt bakes great cakes.|4|fam
cousin|n|🧒|ابن العم / ابن الخال|The child of your aunt or uncle.|I play football with my cousin.|4|fam
parents|n|👫|الوالدان|Your mother and father.|My parents are proud of me.|4|fam
neighbor|n|🏘️|جار|A person who lives near you.|Our neighbor has a white cat.|4|fam
guest|n|🛎️|ضيف|A person you invite to your home.|We made tea for our guests.|5|fam
people|n|👥|ناس|More than one person.|Many people were at the park.|3|fam
child|n|🧒|طفل|A young boy or girl.|Every child needs to sleep well.|3|fam
boy|n|👦|ولد|A male child.|The boy is riding a bike.|3|fam
girl|n|👧|بنت|A female child.|The girl is reading a book.|3|fam
man|n|👨|رجل|A grown-up male person.|The man is carrying a box.|3|fam
woman|n|👩|امرأة|A grown-up female person.|The woman is buying bread.|3|fam
twin|n|👯|توأم|One of two children born at the same time to the same mother.|Sara and Mona are twins.|5|fam
team|n|👥|فريق|A group of people who work or play together.|Our team won the game.|4|fam
head|n|🗣️|رأس|The top part of your body, where your eyes and mouth are.|Wear a hat on your head.|3|body
eye|n|👁️|عين|The part of your face that you see with.|Close your eyes and sleep.|3|body
ear|n|👂|أذن|The part of your head that you hear with.|I hear music with my ears.|3|body
nose|n|👃|أنف|The part of your face that you smell with.|A dog has a very good nose.|3|body
mouth|n|👄|فم|The part of your face that you eat and talk with.|Open your mouth, please.|3|body
teeth|n|🦷|أسنان|The hard white things in your mouth that you bite with.|Brush your teeth twice a day.|3|body
hand|n|✋|يد|The part at the end of your arm with fingers.|Wash your hands before you eat.|3|body
arm|n|💪|ذراع|The long part of your body between your shoulder and your hand.|He broke his arm.|3|body
leg|n|🦵|ساق / رجل|The long part of your body that you stand and walk on.|A spider has eight legs.|3|body
foot|n|🦶|قدم|The part at the end of your leg that you stand on.|My foot is in the sand.|3|body
finger|n|☝️|إصبع|One of the five long parts at the end of your hand.|I have ten fingers.|3|body
hair|n|💇|شعر|The thin things that grow on your head.|She has long black hair.|3|body
face|n|🙂|وجه|The front part of your head.|Wash your face in the morning.|3|body
shoulder|n|🤷|كتف|The part of your body between your neck and your arm.|The bird sat on his shoulder.|4|body
knee|n|🦵|ركبة|The middle part of your leg that bends.|I hurt my knee when I fell.|4|body
neck|n|🦒|رقبة|The part of your body between your head and your shoulders.|A giraffe has a long neck.|4|body
heart|n|❤️|قلب|The part inside your chest that pumps blood.|Running makes your heart beat fast.|4|body
brain|n|🧠|دماغ|The part inside your head that you think with.|Your brain helps you learn.|4|body
stomach|n|🫃|معدة|The part inside your body where food goes after you eat.|My stomach is full.|5|body
bone|n|🦴|عظم|One of the hard parts inside your body.|Milk is good for your bones.|4|body
skin|n|🖐️|جلد|The outside cover of your body.|Sun cream protects your skin.|5|body
blood|n|🩸|دم|The red liquid that moves inside your body.|The heart pumps blood.|5|body
sick|adj|🤒|مريض|Not healthy; you feel bad in your body.|I stayed home because I was sick.|4|body
healthy|adj|💪|صحي / بصحة جيدة|Strong and not sick.|Fruit helps you stay healthy.|4|body
headache|n|🤕|صداع|A pain in your head.|I have a headache, so I will rest.|5|body
fever|n|🌡️|حمى / حرارة|When your body is hotter than normal because you are sick.|The doctor said I have a fever.|5|body
medicine|n|💊|دواء|Something you take to help you get better when you are sick.|Take your medicine after lunch.|5|body
tired|adj|🥱|متعب|Feeling that you need to rest or sleep.|I am tired after the long trip.|4|body
cough|v|😷|يسعل|To push air out of your throat with a loud noise.|Cover your mouth when you cough.|5|body
apple|n|🍎|تفاحة|A round fruit that is red, green or yellow.|I eat an apple every day.|3|food
banana|n|🍌|موزة|A long yellow fruit.|Monkeys love bananas.|3|food
orange|n|🍊|برتقالة|A round orange fruit with juice inside.|I drink orange juice.|3|food
grapes|n|🍇|عنب|Small round fruits that grow together in a bunch.|Grapes can be green or purple.|3|food
watermelon|n|🍉|بطيخ|A big green fruit that is red and juicy inside.|Watermelon is great in summer.|4|food
strawberry|n|🍓|فراولة|A small red fruit with tiny seeds on the outside.|I like strawberry jam.|4|food
lemon|n|🍋|ليمون|A yellow fruit that tastes sour.|Lemons are very sour.|4|food
dates|n|🌴|تمر|Sweet brown fruits that grow on palm trees.|We eat dates with coffee.|3|food
mango|n|🥭|مانجو|A sweet fruit that is orange inside.|This mango is very sweet.|4|food
carrot|n|🥕|جزرة|A long orange vegetable.|Rabbits like carrots.|3|food
tomato|n|🍅|طماطم|A soft round red food used in salads.|Put a tomato in the salad.|3|food
potato|n|🥔|بطاطس|A vegetable that grows under the ground.|We had potatoes for lunch.|3|food
onion|n|🧅|بصل|A round vegetable with a strong smell.|Cutting onions makes me cry.|4|food
cucumber|n|🥒|خيار|A long green vegetable that you eat fresh.|I like cucumber in my salad.|4|food
salad|n|🥗|سلطة|A mix of cold vegetables.|Mom made a fresh salad.|4|food
bread|n|🍞|خبز|A food made from flour and baked.|I eat bread with cheese.|3|food
rice|n|🍚|أرز|Small white grains that we cook and eat.|We eat rice with chicken.|3|food
egg|n|🥚|بيضة|An oval food that comes from a hen.|I had an egg for breakfast.|3|food
cheese|n|🧀|جبن|A food made from milk.|I like cheese sandwiches.|3|food
chicken|n|🍗|دجاج|Meat from a hen.|We cooked chicken for dinner.|3|food
fish|n|🐟|سمك|An animal that lives in water; we can eat it.|Fish is good for you.|3|food
meat|n|🥩|لحم|Food that comes from animals.|Lions eat meat.|4|food
soup|n|🍲|شوربة|Hot liquid food made from vegetables or meat.|Soup is nice on a cold day.|4|food
sandwich|n|🥪|شطيرة|Two pieces of bread with food between them.|I take a sandwich to school.|4|food
cake|n|🎂|كعكة|A sweet baked food for parties.|We had cake on my birthday.|3|food
cookie|n|🍪|بسكويت / كعكة صغيرة|A small sweet flat cake.|Grandma baked cookies.|4|food
honey|n|🍯|عسل|A sweet food that bees make.|I put honey on my bread.|4|food
sugar|n|🍬|سكر|Something sweet you add to food and drinks.|Too much sugar is bad for your teeth.|4|food
salt|n|🧂|ملح|White powder that makes food taste better.|Add a little salt to the soup.|4|food
water|n|💧|ماء|The clear liquid that we drink.|Drink water when you are thirsty.|3|food
milk|n|🥛|حليب|A white drink that comes from cows.|Milk helps your bones grow.|3|food
juice|n|🧃|عصير|A drink made from fruit.|I drink apple juice.|3|food
tea|n|🍵|شاي|A hot drink made from dried leaves.|Dad drinks tea every evening.|3|food
breakfast|n|🍳|فطور|The first meal of the day.|Eat breakfast before school.|4|food
lunch|n|🍱|غداء|The meal you eat in the middle of the day.|We have lunch at one o'clock.|4|food
dinner|n|🍽️|عشاء|The meal you eat in the evening.|What's for dinner?|4|food
hungry|adj|😋|جائع|Wanting to eat.|I am hungry. Can I have a snack?|4|food
thirsty|adj|🥵|عطشان|Wanting to drink.|Running makes me thirsty.|4|food
delicious|adj|😋|لذيذ|Tastes very good.|This pizza is delicious!|5|food
vegetable|n|🥦|خضار|A plant that we eat, like a carrot or a potato.|Eat your vegetables.|4|food
fruit|n|🍑|فاكهة|The sweet part of a plant that we eat, like an apple.|Fruit is a healthy snack.|3|food
pizza|n|🍕|بيتزا|Flat bread with cheese and tomato on top.|We ate pizza on Friday.|3|food
ice cream|n|🍦|آيس كريم|A cold, sweet, creamy food.|I want chocolate ice cream.|3|food
chocolate|n|🍫|شوكولاتة|A sweet brown food.|Don't eat too much chocolate.|3|food
popcorn|n|🍿|فشار|Corn that pops when it gets hot.|We ate popcorn and watched a film.|5|food
cat|n|🐱|قطة|A small animal with soft fur that says "meow".|My cat sleeps on my bed.|3|ani
dog|n|🐶|كلب|An animal that barks.|The dog runs after the ball.|3|ani
bird|n|🐦|طائر|An animal with feathers and wings.|The bird is singing.|3|ani
horse|n|🐴|حصان|A big strong animal that people ride.|He rides a horse.|3|ani
camel|n|🐪|جمل|A desert animal with a hump on its back.|Camels can walk for days without water.|3|ani
cow|n|🐄|بقرة|A farm animal that gives us milk.|The cow is eating grass.|3|ani
sheep|n|🐑|خروف|A farm animal with thick wool.|We get wool from sheep.|3|ani
goat|n|🐐|ماعز|A farm animal with horns that can climb rocks.|The goat is on the hill.|4|ani
duck|n|🦆|بطة|A bird that swims and says "quack".|The ducks are in the pond.|3|ani
hen|n|🐔|دجاجة|A female chicken that lays eggs.|The hen laid three eggs.|4|ani
rabbit|n|🐰|أرنب|A small animal with long ears that hops.|The rabbit is eating a carrot.|3|ani
mouse|n|🐭|فأر|A very small animal with a long tail.|The cat is chasing a mouse.|3|ani
lion|n|🦁|أسد|A big wild cat that roars.|The lion is the king of the jungle.|3|ani
tiger|n|🐯|نمر|A big wild cat with orange fur and black stripes.|A tiger has stripes.|3|ani
elephant|n|🐘|فيل|A very big grey animal with a long trunk.|An elephant has big ears.|3|ani
monkey|n|🐒|قرد|An animal that is good at climbing trees.|The monkey is eating a banana.|3|ani
giraffe|n|🦒|زرافة|A very tall animal with a long neck.|A giraffe eats leaves from tall trees.|4|ani
zebra|n|🦓|حمار وحشي|A wild animal like a horse with black and white stripes.|Zebras live in Africa.|4|ani
bear|n|🐻|دب|A big strong animal with thick fur.|The bear is catching fish.|3|ani
snake|n|🐍|ثعبان|A long animal with no legs.|Some snakes are dangerous.|4|ani
frog|n|🐸|ضفدع|A small green animal that jumps and lives near water.|The frog jumped into the pond.|3|ani
turtle|n|🐢|سلحفاة|An animal with a hard shell on its back.|The turtle walks slowly.|4|ani
whale|n|🐋|حوت|A very big animal that lives in the sea.|The whale is the biggest animal.|4|ani
dolphin|n|🐬|دلفين|A smart sea animal that likes to jump.|Dolphins are very friendly.|4|ani
shark|n|🦈|سمك القرش|A big fish with sharp teeth.|The shark swims fast.|4|ani
octopus|n|🐙|أخطبوط|A sea animal with eight arms.|An octopus has eight arms.|5|ani
bee|n|🐝|نحلة|A flying insect that makes honey.|Bees make honey.|3|ani
butterfly|n|🦋|فراشة|An insect with big colorful wings.|The butterfly is on the flower.|4|ani
ant|n|🐜|نملة|A very small insect that lives in big groups.|Ants work very hard.|4|ani
spider|n|🕷️|عنكبوت|A small animal with eight legs that makes webs.|The spider made a web.|4|ani
owl|n|🦉|بومة|A bird that is awake at night.|The owl can see in the dark.|4|ani
eagle|n|🦅|نسر|A big strong bird that hunts.|The eagle flies very high.|5|ani
penguin|n|🐧|بطريق|A black and white bird that swims but cannot fly.|Penguins live in cold places.|4|ani
fox|n|🦊|ثعلب|A wild animal with red fur and a long tail.|The fox is very clever.|4|ani
wolf|n|🐺|ذئب|A wild animal like a big dog.|The wolf howls at night.|5|ani
crocodile|n|🐊|تمساح|A big animal with sharp teeth that lives in rivers.|The crocodile has a long mouth.|5|ani
pet|n|🐕|حيوان أليف|An animal that lives with you at home.|My pet is a parrot.|4|ani
wing|n|🪽|جناح|The part of a bird or insect that it flies with.|The bird opened its wings.|4|ani
tail|n|🐒|ذيل|The long part at the back of an animal.|The dog wags its tail.|4|ani
feather|n|🪶|ريشة|One of the soft light things on a bird's body.|I found a blue feather.|5|ani
nest|n|🪺|عش|The home a bird builds for its eggs.|There are eggs in the nest.|5|ani
insect|n|🐞|حشرة|A very small animal with six legs.|An ant is an insect.|5|ani
house|n|🏠|منزل|A building where people live.|Our house has a garden.|3|home
room|n|🚪|غرفة|A part of a house with walls and a door.|This is my room.|3|home
bedroom|n|🛏️|غرفة نوم|The room where you sleep.|My bedroom is blue.|3|home
kitchen|n|🍳|مطبخ|The room where you cook food.|Mom is in the kitchen.|3|home
bathroom|n|🛁|حمام|The room where you wash.|Brush your teeth in the bathroom.|3|home
living room|n|🛋️|غرفة المعيشة|The room where a family sits and talks.|We watch TV in the living room.|4|home
garden|n|🌷|حديقة|Land near a house where flowers and plants grow.|We have roses in our garden.|3|home
door|n|🚪|باب|You open it to go in or out of a room.|Please close the door.|3|home
window|n|🪟|نافذة|A glass opening in a wall that lets in light.|Open the window, please.|3|home
wall|n|🧱|جدار|The side of a room or building.|There is a clock on the wall.|4|home
floor|n|🟫|أرضية|The part of a room you walk on.|Don't leave toys on the floor.|4|home
roof|n|🏠|سقف / سطح|The top cover of a building.|The cat is on the roof.|5|home
stairs|n|🪜|درج|Steps that you walk up or down.|Go up the stairs to your room.|4|home
bed|n|🛏️|سرير|You sleep on it.|I go to bed at nine.|3|home
table|n|🪑|طاولة|Furniture with a flat top and legs.|The food is on the table.|3|home
chair|n|🪑|كرسي|A seat for one person.|Sit on the chair.|3|home
sofa|n|🛋️|أريكة|A long soft seat for two or more people.|Grandpa is sleeping on the sofa.|4|home
lamp|n|💡|مصباح|A thing that gives light.|Turn on the lamp to read.|4|home
mirror|n|🪞|مرآة|Glass where you can see yourself.|Look in the mirror.|5|home
clock|n|🕰️|ساعة حائط|A thing that shows the time.|The clock says three o'clock.|3|home
key|n|🔑|مفتاح|A small metal thing that opens a lock.|I lost my key.|4|home
cup|n|☕|كوب|A small container you drink from.|A cup of milk, please.|3|home
plate|n|🍽️|طبق|A flat dish you put food on.|Put the rice on the plate.|4|home
spoon|n|🥄|ملعقة|You use it to eat soup.|Eat with a spoon.|3|home
fork|n|🍴|شوكة|You use it to pick up food.|I eat salad with a fork.|4|home
knife|n|🔪|سكين|A sharp tool for cutting.|Be careful with the knife.|4|home
fridge|n|🧊|ثلاجة|A cold box that keeps food fresh.|Put the milk in the fridge.|4|home
oven|n|🔥|فرن|You bake food in it.|The cake is in the oven.|5|home
towel|n|🧖|منشفة|A cloth you use to dry yourself.|Dry your hands with a towel.|5|home
soap|n|🧼|صابون|You use it with water to wash.|Wash your hands with soap.|4|home
toy|n|🧸|لعبة|A thing children play with.|Put your toys in the box.|3|home
box|n|📦|صندوق|A container with flat sides.|The shoes are in the box.|3|home
pillow|n|🛌|وسادة|A soft thing you put your head on in bed.|My pillow is very soft.|5|home
school|n|🏫|مدرسة|A place where children learn.|I walk to school.|3|sch
teacher|n|🧑‍🏫|معلم|A person who helps you learn.|Our teacher is very kind.|3|sch
student|n|🧑‍🎓|طالب|A person who learns at a school.|There are 25 students in my class.|3|sch
class|n|👩‍🏫|فصل / حصة|A group of students who learn together.|My class is on the first floor.|3|sch
classroom|n|🏫|غرفة الصف|The room where students learn.|Our classroom has big windows.|4|sch
book|n|📘|كتاب|Pages with words that you read.|Open your book to page ten.|3|sch
notebook|n|📓|دفتر|A book with empty pages for writing.|Write the words in your notebook.|3|sch
pen|n|🖊️|قلم حبر|You write with it using ink.|Can I use your pen?|3|sch
pencil|n|✏️|قلم رصاص|You write or draw with it, and you can erase it.|Sharpen your pencil.|3|sch
eraser|n|🧽|ممحاة|You use it to remove pencil marks.|I need an eraser.|3|sch
ruler|n|📏|مسطرة|You use it to draw straight lines and measure.|Use a ruler to draw a line.|3|sch
bag|n|🎒|حقيبة|You carry your books in it.|My bag is heavy.|3|sch
desk|n|🪑|مكتب / طاولة الطالب|A table you sit at to read or write.|Put your book on your desk.|3|sch
board|n|🧑‍🏫|سبورة|The big surface at the front of a classroom that a teacher writes on.|The teacher wrote on the board.|4|sch
crayon|n|🖍️|قلم تلوين|A colored stick of wax for drawing.|Color the sun with a yellow crayon.|4|sch
scissors|n|✂️|مقص|A tool with two blades for cutting paper.|Cut the paper with scissors.|4|sch
glue|n|🧴|غراء / صمغ|You use it to stick things together.|Stick the picture with glue.|4|sch
paper|n|📄|ورق|Thin sheets that you write or draw on.|Draw a tree on the paper.|3|sch
library|n|📚|مكتبة|A place with many books you can borrow.|I read in the library.|4|sch
lesson|n|📖|درس|A time when you learn something.|Today's lesson is about plants.|4|sch
homework|n|📝|واجب منزلي|School work that you do at home.|I finish my homework after lunch.|4|sch
test|n|📝|اختبار|Questions that check what you know.|I studied for the math test.|4|sch
question|n|❓|سؤال|Something you ask to find out an answer.|Can I ask a question?|4|sch
answer|n|✅|إجابة|What you say or write back to a question.|Write the answer here.|4|sch
word|n|🔤|كلمة|A group of letters that has a meaning.|"Cat" is a short word.|3|sch
letter|n|🔠|حرف / رسالة|One of the signs we use to write words, like A or B. Also a message you send.|"B" is the second letter.|4|sch
sentence|n|✍️|جملة|A group of words that tells a complete idea.|Write a sentence about your pet.|5|sch
page|n|📄|صفحة|One side of a sheet of paper in a book.|Turn to the next page.|4|sch
math|n|➕|رياضيات|The subject about numbers.|I like math.|4|sch
science|n|🔬|علوم|The subject that studies nature and how things work.|In science, we learned about plants.|4|sch
English|n|🔤|اللغة الإنجليزية|The language people speak in England, America and many other countries.|We have English on Sunday.|4|sch
Arabic|n|📝|اللغة العربية|The language people speak in Saudi Arabia and many other countries.|Arabic is my first language.|4|sch
art|n|🎨|فن / تربية فنية|Drawing, painting and making beautiful things.|We painted pictures in art.|4|sch
playground|n|🛝|ساحة اللعب|A place outside where children play.|We play in the playground at break.|4|sch
break|n|🔔|فسحة / استراحة|A short rest from work or lessons.|We eat a snack at break.|4|sch
mistake|n|❌|خطأ|Something that is not correct.|It's OK to make mistakes.|5|sch
dictionary|n|📖|قاموس|A book that tells you what words mean.|Look up the word in the dictionary.|5|sch
idea|n|💡|فكرة|A thought or a plan in your mind.|I have a great idea!|5|sch
mosque|n|🕌|مسجد|A building where Muslims pray.|We pray at the mosque.|3|town
hospital|n|🏥|مستشفى|A place where doctors and nurses help sick people.|The nurse works at the hospital.|3|town
park|n|🏞️|منتزه / حديقة عامة|A big green place with trees where people walk and play.|We had a picnic in the park.|3|town
shop|n|🏪|متجر / محل|A place where you buy things.|Let's buy bread from the shop.|3|town
supermarket|n|🛒|سوبرماركت|A big shop that sells food and other things.|We buy food at the supermarket.|4|town
restaurant|n|🍽️|مطعم|A place where you buy and eat meals.|We ate at a restaurant.|4|town
bank|n|🏦|بنك / مصرف|A place that keeps people's money safe.|Dad went to the bank.|4|town
zoo|n|🦓|حديقة حيوانات|A place where people can see wild animals.|We saw lions at the zoo.|3|town
farm|n|🚜|مزرعة|Land where people grow food and keep animals.|There are cows on the farm.|3|town
city|n|🏙️|مدينة|A big town where many people live.|Riyadh is a big city.|4|town
village|n|🏡|قرية|A very small town in the countryside.|My grandfather lives in a village.|5|town
street|n|🛣️|شارع|A road in a town with buildings on its sides.|Look both ways before you cross the street.|4|town
road|n|🛣️|طريق|A wide way for cars to drive on.|The road to Makkah is long.|4|town
bridge|n|🌉|جسر|It goes over a river or road so you can cross.|We drove over the bridge.|5|town
museum|n|🏛️|متحف|A building where you can see old or special things.|We saw old coins at the museum.|5|town
airport|n|🛫|مطار|A place where planes take off and land.|We went to the airport to fly to Jeddah.|4|town
beach|n|🏖️|شاطئ|The sandy land next to the sea.|We built a sandcastle on the beach.|4|town
pharmacy|n|💊|صيدلية|A shop where you buy medicine.|Mom bought medicine at the pharmacy.|5|town
bakery|n|🥖|مخبز|A shop that makes and sells bread and cakes.|The bakery smells delicious.|5|town
building|n|🏢|مبنى|A structure with walls and a roof, like a house or school.|That building is very tall.|4|town
country|n|🗺️|دولة / بلد|A land with its own people and government.|Saudi Arabia is a big country.|5|town
doctor|n|👨‍⚕️|طبيب|A person who helps sick people get better.|The doctor checked my ears.|3|job
nurse|n|👩‍⚕️|ممرض|A person who looks after sick people in a hospital.|The nurse gave me medicine.|4|job
dentist|n|🦷|طبيب أسنان|A doctor who looks after your teeth.|I visit the dentist twice a year.|5|job
pilot|n|👨‍✈️|طيار|A person who flies a plane.|The pilot flies the plane to Dubai.|4|job
police officer|n|👮|شرطي|A person whose job is to keep people safe and stop crime.|The police officer helped us.|4|job
firefighter|n|🧑‍🚒|رجل إطفاء|A person who puts out fires.|The firefighter is very brave.|4|job
farmer|n|🧑‍🌾|مزارع|A person who works on a farm.|The farmer grows dates.|4|job
driver|n|🧑‍✈️|سائق|A person who drives a car, bus or truck.|The bus driver is careful.|4|job
cook|n|🧑‍🍳|طباخ|A person who makes food.|My father is a great cook.|4|job
engineer|n|👷|مهندس|A person who designs buildings, roads or machines.|An engineer built this bridge.|5|job
scientist|n|🧑‍🔬|عالِم|A person who studies how the world works.|The scientist looked in the microscope.|5|job
artist|n|🧑‍🎨|فنان / رسام|A person who draws, paints or makes art.|The artist painted the sea.|5|job
astronaut|n|🧑‍🚀|رائد فضاء|A person who travels into space.|The astronaut went to the space station.|5|job
mechanic|n|🧑‍🔧|ميكانيكي|A person who fixes cars and machines.|The mechanic fixed our car.|5|job
vet|n|🐕‍🦺|طبيب بيطري|A doctor for animals.|We took our cat to the vet.|5|job
job|n|💼|وظيفة / عمل|The work a person does to earn money.|What is your father's job?|5|job
car|n|🚗|سيارة|A vehicle with four wheels that people drive.|We go to school by car.|3|trans
bus|n|🚌|حافلة|A big vehicle that carries many people.|I take the bus to school.|3|trans
bike|n|🚲|دراجة|A vehicle with two wheels that you pedal.|I ride my bike in the park.|3|trans
plane|n|✈️|طائرة|A machine that flies in the sky and carries people.|The plane is in the sky.|3|trans
train|n|🚆|قطار|A long vehicle that runs on rails.|The train is very fast.|3|trans
boat|n|⛵|قارب|A small vehicle that moves on water.|We went fishing in a boat.|3|trans
ship|n|🚢|سفينة|A very big boat.|The ship crossed the sea.|4|trans
taxi|n|🚕|سيارة أجرة|A car you pay to ride in.|We took a taxi to the hotel.|4|trans
truck|n|🚚|شاحنة|A big vehicle that carries heavy things.|The truck carries sand.|4|trans
motorbike|n|🏍️|دراجة نارية|A bike with an engine.|The motorbike is very loud.|5|trans
helicopter|n|🚁|طائرة مروحية|An aircraft with spinning blades on top.|The helicopter landed on the roof.|5|trans
wheel|n|🛞|عجلة|A round part that turns so a car or bike can move.|A bike has two wheels.|4|trans
ticket|n|🎫|تذكرة|A small paper that shows you paid to travel or see something.|Show your ticket, please.|5|trans
traffic|n|🚦|حركة المرور|All the cars on a road.|There was a lot of traffic today.|5|trans
sun|n|☀️|شمس|The bright star that gives us light and heat.|The sun is very hot today.|3|nat
moon|n|🌙|قمر|It shines in the sky at night.|The moon is full tonight.|3|nat
star|n|⭐|نجمة|A small bright light in the night sky.|I can see many stars.|3|nat
sky|n|🌌|سماء|The space above the earth where the clouds are.|The sky is blue.|3|nat
cloud|n|☁️|سحابة|A white or grey shape in the sky made of water drops.|Dark clouds bring rain.|3|nat
rain|n|🌧️|مطر|Water that falls from clouds.|I love the smell of rain.|3|nat
wind|n|💨|رياح|Air that moves fast.|The wind is strong today.|3|nat
snow|n|❄️|ثلج|Soft white ice that falls from the sky when it's very cold.|It snows in winter in some countries.|3|nat
storm|n|⛈️|عاصفة|Very bad weather with strong wind and rain.|Stay inside during a storm.|4|nat
rainbow|n|🌈|قوس قزح|An arc of colors in the sky after rain.|Look, a rainbow!|4|nat
weather|n|🌦️|طقس|What it's like outside: sunny, rainy, hot or cold.|What's the weather like today?|4|nat
hot|adj|🥵|حار|Very warm.|Summer is hot in Riyadh.|3|nat
cold|adj|🥶|بارد|Not warm; low temperature.|The water is cold.|3|nat
warm|adj|🌤️|دافئ|A little hot, in a nice way.|The jacket keeps me warm.|4|nat
sunny|adj|🌞|مشمس|When the sun is shining.|It's a sunny day.|4|nat
rainy|adj|🌧️|ممطر|When it is raining.|Take an umbrella on a rainy day.|4|nat
windy|adj|🌬️|عاصف / فيه رياح|When there is a lot of wind.|It's windy, so hold your hat.|4|nat
cloudy|adj|🌥️|غائم|When there are many clouds in the sky.|It is cloudy today.|4|nat
tree|n|🌳|شجرة|A tall plant with a trunk, branches and leaves.|Birds live in the tree.|3|nat
flower|n|🌸|زهرة|The colorful part of a plant.|She gave me a flower.|3|nat
grass|n|🌱|عشب|Thin green plants that cover the ground.|Cows eat grass.|3|nat
leaf|n|🍃|ورقة شجر|One of the flat green parts of a plant.|The leaf fell from the tree.|4|nat
plant|n|🪴|نبات|A living thing that grows in the soil, like a tree or flower.|Water the plant every day.|3|nat
seed|n|🌰|بذرة|A small thing that a new plant grows from.|Plant the seed in the soil.|4|nat
river|n|🏞️|نهر|A long line of water that flows to the sea.|The Nile is a long river.|4|nat
sea|n|🌊|بحر|A very big area of salty water.|We swim in the sea.|3|nat
lake|n|🏞️|بحيرة|A big area of water with land all around it.|There are ducks on the lake.|4|nat
mountain|n|⛰️|جبل|A very high hill.|We climbed the mountain.|4|nat
desert|n|🏜️|صحراء|A dry place with lots of sand and little rain.|Camels live in the desert.|4|nat
forest|n|🌲|غابة|A large place with many trees.|Bears live in the forest.|4|nat
island|n|🏝️|جزيرة|Land with water all around it.|We took a boat to the island.|5|nat
sand|n|🏖️|رمل|Tiny pieces of rock on the beach or in the desert.|The sand is hot.|4|nat
rock|n|🪨|صخرة|A hard piece of stone.|He sat on a big rock.|4|nat
earth|n|🌍|الأرض|The planet we live on.|The Earth goes around the sun.|4|nat
air|n|🌬️|هواء|What we breathe; it is all around us.|Plants need air and water.|4|nat
fire|n|🔥|نار|Hot bright flames.|Don't play with fire.|4|nat
ocean|n|🌊|محيط|A very, very big sea.|Whales live in the ocean.|5|nat
volcano|n|🌋|بركان|A mountain that can throw out hot melted rock.|The volcano is smoking.|5|nat
spring|n|🌷|الربيع|The season after winter, when flowers grow.|Flowers grow in spring.|4|nat
summer|n|☀️|الصيف|The hottest season of the year.|We swim in summer.|4|nat
autumn|n|🍂|الخريف|The season after summer, when leaves fall.|Leaves fall in autumn.|4|nat
winter|n|⛄|الشتاء|The coldest season of the year.|It's cold in winter.|4|nat
season|n|🗓️|فصل من فصول السنة|One of the four parts of the year.|My favorite season is spring.|5|nat
morning|n|🌅|صباح|The early part of the day.|I wake up in the morning.|3|time
afternoon|n|🌇|بعد الظهر|The part of the day after lunch.|We play in the afternoon.|4|time
evening|n|🌆|مساء|The part of the day when it starts to get dark.|We visit grandma in the evening.|4|time
night|n|🌃|ليل|The time when it is dark and people sleep.|I sleep at night.|3|time
day|n|📆|يوم|24 hours; also the time when it is light.|There are seven days in a week.|3|time
week|n|🗓️|أسبوع|Seven days.|I go to the park once a week.|3|time
month|n|📅|شهر|About four weeks; there are twelve in a year.|Ramadan is a special month.|4|time
year|n|🎆|سنة|Twelve months.|I am nine years old.|3|time
today|adv|📍|اليوم|This day.|Today is Sunday.|3|time
tomorrow|adv|➡️|غدًا|The day after today.|See you tomorrow!|4|time
yesterday|adv|⬅️|أمس|The day before today.|I went to the zoo yesterday.|4|time
hour|n|⏳|ساعة (٦٠ دقيقة)|Sixty minutes.|The trip took one hour.|4|time
minute|n|⏱️|دقيقة|Sixty seconds.|Wait a minute, please.|4|time
birthday|n|🎂|عيد ميلاد|The day you were born, every year.|My birthday is in May.|3|time
holiday|n|🏖️|إجازة / عطلة|A time when you don't go to school or work.|We go to the beach on holiday.|4|time
weekend|n|🛋️|عطلة نهاية الأسبوع|Friday and Saturday, when there is no school.|We visit our cousins at the weekend.|4|time
early|adj|🐓|مبكر|Before the usual time.|I go to bed early.|4|time
late|adj|⏰|متأخر|After the usual time.|Don't be late for school.|4|time
always|adv|🔁|دائمًا|Every time.|I always brush my teeth.|5|time
never|adv|🚫|أبدًا|Not at any time.|I never eat in class.|5|time
sometimes|adv|🔀|أحيانًا|Not always, but some of the time.|Sometimes we eat pizza.|5|time
calendar|n|📅|تقويم|A page that shows the days and months of the year.|Look at the calendar for the date.|5|time
football|n|⚽|كرة القدم|A game where two teams kick a ball into a goal.|We play football after school.|3|sport
basketball|n|🏀|كرة السلة|A game where you throw a ball through a high ring.|He is tall and good at basketball.|4|sport
tennis|n|🎾|التنس|A game where you hit a ball over a net with a racket.|Let's play tennis.|4|sport
swimming|n|🏊|السباحة|Moving through water using your arms and legs.|Swimming is good exercise.|4|sport
running|n|🏃|الجري|Moving very fast on your feet.|Running makes me strong.|4|sport
ball|n|⚽|كرة|A round thing you throw, kick or catch.|Throw me the ball!|3|sport
game|n|🎲|لعبة / مباراة|Something you play that has rules.|Let's play a game.|3|sport
goal|n|🥅|هدف|When the ball goes into the net. Also something you want to do.|He scored a goal!|4|sport
winner|n|🏆|فائز|The person or team that wins.|The winner gets a cup.|5|sport
race|n|🏁|سباق|A competition to see who is fastest.|I won the race!|4|sport
hobby|n|🧩|هواية|Something you like to do in your free time.|My hobby is drawing.|5|sport
puzzle|n|🧩|أحجية / لغز|A game or problem that you solve by thinking.|I finished the puzzle.|4|sport
music|n|🎵|موسيقى|Sounds that are nice to listen to.|I listen to music.|4|sport
picture|n|🖼️|صورة|A drawing, painting or photo.|Draw a picture of your family.|3|sport
camera|n|📷|كاميرا|A machine for taking photos.|I took a photo with my camera.|4|sport
kite|n|🪁|طائرة ورقية|A toy that flies in the wind on a long string.|We fly kites on windy days.|4|sport
chess|n|♟️|الشطرنج|A thinking game for two players on a board.|My grandpa taught me chess.|5|sport
reading|n|📚|القراءة|Looking at words and understanding them.|Reading is my favorite hobby.|4|sport
drawing|n|🖍️|الرسم|Making pictures with a pencil or crayons.|Her drawing is beautiful.|4|sport
shirt|n|👕|قميص|Clothes you wear on the top part of your body.|I'm wearing a white shirt.|3|clo
dress|n|👗|فستان|One piece of clothing for girls and women.|She has a pink dress.|3|clo
shoes|n|👟|حذاء|You wear them on your feet.|Put on your shoes.|3|clo
socks|n|🧦|جوارب|You wear them on your feet under your shoes.|My socks are blue.|3|clo
hat|n|👒|قبعة|You wear it on your head.|Wear a hat in the sun.|3|clo
cap|n|🧢|كاب / قبعة|A soft hat with a part at the front.|He wears a red cap.|4|clo
jacket|n|🧥|سترة / جاكيت|A short coat.|Take your jacket; it's cold.|4|clo
coat|n|🧥|معطف|Warm clothes you wear over other clothes.|I wear a coat in winter.|4|clo
trousers|n|👖|بنطال|Clothes that cover each leg.|These trousers are too long.|4|clo
skirt|n|👗|تنورة|Girls' clothes that hang down from the waist.|She has a long skirt.|4|clo
gloves|n|🧤|قفازات|You wear them on your hands.|Wear gloves when it snows.|5|clo
scarf|n|🧣|وشاح|A long piece of cloth you wear around your neck.|My scarf keeps me warm.|5|clo
glasses|n|👓|نظارة|You wear them on your eyes to see better.|My father wears glasses.|4|clo
watch|n|⌚|ساعة يد|A small clock you wear on your wrist.|My watch is new.|4|clo
uniform|n|🥋|زي موحد|Special clothes that everyone in a school or job wears.|We wear a uniform at school.|5|clo
pocket|n|👖|جيب|A small bag sewn into clothes.|I put the key in my pocket.|5|clo
clothes|n|👚|ملابس|Things you wear, like shirts and trousers.|Put your clothes in the cupboard.|4|clo
happy|adj|😀|سعيد|Feeling good.|I am happy today.|3|feel
sad|adj|😢|حزين|Feeling unhappy.|He is sad because he lost his toy.|3|feel
angry|adj|😠|غاضب|Feeling very upset with someone or something.|Don't be angry with me.|4|feel
scared|adj|😨|خائف|Feeling afraid.|I'm scared of the dark.|4|feel
excited|adj|🤩|متحمس|Very happy about something that will happen.|I'm excited about the trip!|5|feel
bored|adj|😐|ملول / يشعر بالملل|Not interested; nothing to do.|I'm bored. Let's play.|5|feel
surprised|adj|😮|متفاجئ|Feeling something you did not expect.|I was surprised by the gift.|5|feel
proud|adj|🥲|فخور|Happy about something good you or someone else did.|My mom is proud of me.|5|feel
kind|adj|🤗|لطيف / طيّب|Nice and helpful to others.|Be kind to animals.|4|feel
brave|adj|🦸|شجاع|Not afraid to do something difficult.|The brave boy helped his friend.|5|feel
funny|adj|😂|مضحك|Makes you laugh.|That joke is funny.|4|feel
big|adj|🐘|كبير|Large in size.|An elephant is big.|3|feel
small|adj|🐁|صغير|Little in size.|A mouse is small.|3|feel
tall|adj|🦒|طويل|High from top to bottom.|My brother is tall.|3|feel
short|adj|📏|قصير|Not tall or not long.|This pencil is short.|3|feel
long|adj|🐍|طويل (في الطول)|Far from one end to the other.|A snake is long.|3|feel
fast|adj|🐆|سريع|Moving quickly.|A cheetah is very fast.|3|feel
slow|adj|🐢|بطيء|Not fast.|A turtle is slow.|3|feel
old|adj|🧓|قديم / كبير في السن|Not new or not young.|My grandfather is old.|3|feel
new|adj|✨|جديد|Not used before.|I have new shoes.|3|feel
young|adj|👶|صغير في السن|Not old.|My cousin is very young.|4|feel
beautiful|adj|🌹|جميل|Very nice to look at.|What a beautiful flower!|4|feel
clean|adj|🧽|نظيف|Not dirty.|My room is clean.|4|feel
dirty|adj|🟤|متسخ|Not clean.|My hands are dirty.|4|feel
heavy|adj|🏋️|ثقيل|Weighs a lot; hard to lift.|This bag is heavy.|4|feel
light|adj|🪶|خفيف|Not heavy.|A feather is light.|4|feel
easy|adj|👌|سهل|Not difficult.|The test was easy.|4|feel
difficult|adj|🧗|صعب|Not easy; hard to do.|This puzzle is difficult.|5|feel
quiet|adj|🤫|هادئ|Making very little noise.|Be quiet in the library.|5|feel
loud|adj|📢|عالي الصوت|Making a lot of noise.|The music is too loud.|5|feel
strong|adj|💪|قوي|Has a lot of power.|My father is strong.|4|feel
weak|adj|🥀|ضعيف|Not strong.|I felt weak when I was sick.|5|feel
full|adj|🥛|ممتلئ|Has no more space inside.|The glass is full.|4|feel
empty|adj|🫙|فارغ|Has nothing inside.|The box is empty.|5|feel
soft|adj|🧸|ناعم / طري|Not hard; nice to touch.|My pillow is soft.|4|feel
hard|adj|🪨|صلب / قاسٍ|Not soft; firm.|A rock is hard.|4|feel
wet|adj|💦|مبلل|Covered with water.|My shoes are wet.|4|feel
dry|adj|🏜️|جاف|Not wet.|The desert is dry.|4|feel
same|adj|🟰|نفس الشيء / متشابه|Not different.|We have the same bag.|5|feel
different|adj|🔀|مختلف|Not the same.|My brother and I are very different.|5|feel
favorite|adj|💖|مفضل|The one you like most.|Blue is my favorite color.|4|feel
important|adj|❗|مهم|Matters a lot.|Sleep is important for children.|5|feel
dangerous|adj|⚠️|خطير|Can hurt you.|Fire is dangerous.|5|feel
safe|adj|🛡️|آمن|Not in danger.|Wear a helmet to stay safe.|5|feel
polite|adj|🙇|مهذب|Saying please and thank you; good manners.|Be polite to your teacher.|5|feel
eat|v|🍽️|يأكل|To put food in your mouth and swallow it.|We eat lunch at school.|3|act
drink|v|🥤|يشرب|To take water or juice into your mouth and swallow it.|Drink a glass of water.|3|act
sleep|v|😴|ينام|To rest with your eyes closed.|Babies sleep a lot.|3|act
run|v|🏃|يجري|To move very fast on your feet.|Run to the finish line!|3|act
walk|v|🚶|يمشي|To move on your feet, not fast.|I walk to the mosque.|3|act
jump|v|🦘|يقفز|To push yourself up into the air.|Kangaroos can jump high.|3|act
swim|v|🏊|يسبح|To move through water.|Fish swim in the sea.|3|act
fly|v|🕊️|يطير|To move through the air.|Birds fly in the sky.|3|act
read|v|📖|يقرأ|To look at words and understand them.|I read a story every night.|3|act
write|v|✍️|يكتب|To make letters and words with a pen or pencil.|Write your name here.|3|act
draw|v|🖍️|يرسم|To make a picture with a pencil or crayons.|Draw a cat.|3|act
sing|v|🎤|يغني / ينشد|To make music with your voice.|The children sing a song.|3|act
play|v|🤾|يلعب|To have fun with toys or games.|Let's play outside.|3|act
open|v|📂|يفتح|To make something not closed.|Open the door, please.|3|act
close|v|🚪|يغلق|To shut something.|Close your book.|3|act
sit|v|🪑|يجلس|To rest on a chair or the floor.|Sit down, please.|3|act
stand|v|🧍|يقف|To be on your feet.|Stand in a line.|3|act
look|v|👀|ينظر|To use your eyes to see something.|Look at the board.|3|act
listen|v|👂|يستمع|To pay attention to sounds.|Listen to your teacher.|3|act
speak|v|🗣️|يتكلم|To say words.|Can you speak English?|4|act
talk|v|💬|يتحدث|To speak with someone.|I talk to my friend on the phone.|4|act
climb|v|🧗|يتسلق|To go up using your hands and feet.|Monkeys climb trees.|4|act
throw|v|🤾|يرمي|To send something through the air with your hand.|Throw the ball to me.|4|act
catch|v|🧤|يمسك / يلتقط|To take something that is moving through the air.|Catch the ball!|4|act
kick|v|🦵|يركل|To hit something with your foot.|Kick the ball into the goal.|4|act
carry|v|📦|يحمل|To hold something and take it with you.|Can you carry this box?|4|act
cook|v|🍳|يطبخ|To make food hot and ready to eat.|Mom cooks rice for lunch.|4|act
clean|v|🧹|ينظف|To make something not dirty.|Clean your room.|4|act
wash|v|🧼|يغسل|To clean something with water.|Wash your hands.|4|act
brush|v|🪥|يفرّش / يمشّط|To clean or tidy with a brush.|Brush your teeth before bed.|4|act
help|v|🤝|يساعد|To make things easier for someone.|Can I help you?|3|act
learn|v|🧠|يتعلم|To get to know something new.|We learn English at school.|4|act
study|v|📚|يذاكر / يدرس|To spend time learning something.|I study for my test.|4|act
teach|v|🧑‍🏫|يعلّم|To help someone learn.|My dad teaches me to swim.|4|act
think|v|🤔|يفكر|To use your brain.|Think before you answer.|4|act
know|v|💡|يعرف|To have information in your mind.|I know the answer!|4|act
remember|v|🧠|يتذكر|To keep something in your mind.|Remember to bring your book.|5|act
forget|v|🙈|ينسى|Not to remember.|Don't forget your lunch.|5|act
like|v|👍|يحب / يعجبه|To think something is nice.|I like apples.|3|act
love|v|❤️|يحب كثيرًا|To like someone or something very much.|I love my family.|3|act
want|v|🙋|يريد|To wish to have or do something.|I want a new bike.|3|act
need|v|🆘|يحتاج|Must have something.|Plants need water.|4|act
give|v|🎁|يعطي|To let someone have something.|Give the book to Ali.|4|act
take|v|✋|يأخذ|To get something with your hand.|Take an apple.|4|act
buy|v|🛍️|يشتري|To get something by paying money.|We buy fruit at the market.|4|act
sell|v|🏷️|يبيع|To give something for money.|The shop sells toys.|5|act
find|v|🔍|يجد|To see something you were looking for.|I can't find my pencil.|4|act
lose|v|❓|يُضيّع / يخسر|Not to have something any more; not to win.|Don't lose your key.|5|act
win|v|🏆|يفوز|To be first in a game or race.|Our team won the match.|4|act
build|v|🧱|يبني|To make something by putting parts together.|Let's build a sandcastle.|4|act
grow|v|🌱|ينمو|To get bigger.|Plants grow in the sun.|4|act
go|v|➡️|يذهب|To move from one place to another.|I go to school by bus.|3|act
come|v|⬅️|يأتي|To move to here.|Come here, please.|3|act
visit|v|🏡|يزور|To go to see a person or place.|We visit grandma on Fridays.|4|act
travel|v|🧳|يسافر|To go to another place, often far away.|We travel to Abha in summer.|5|act
arrive|v|🛬|يصل|To get to a place.|The plane arrives at six.|5|act
wait|v|⏳|ينتظر|To stay until something happens.|Wait for the green light.|4|act
start|v|🏁|يبدأ|To begin.|The lesson starts at seven.|4|act
finish|v|✅|ينهي|To end.|I finished my homework.|4|act
stop|v|🛑|يتوقف|To not move or not do something any more.|Stop at the red light.|4|act
try|v|💪|يحاول|To do your best to do something.|Try again!|4|act
answer|v|🙋|يجيب|To say or write something back to a question.|Answer the question.|4|act
ask|v|❓|يسأل|To say a question.|Ask your teacher.|4|act
share|v|🤲|يشارك|To let someone use or have part of something.|Share your toys with your sister.|5|act
smile|v|😊|يبتسم|To make a happy face.|Smile for the photo!|4|act
laugh|v|😂|يضحك|To make sounds because something is funny.|We laughed at the clown.|4|act
cry|v|😭|يبكي|To have tears coming from your eyes.|The baby is crying.|4|act
pray|v|🤲|يصلي / يدعو|To speak to Allah.|We pray five times a day.|4|act
plant|v|🌱|يزرع|To put a seed or plant in the ground.|We planted a tree.|5|act
save|v|🐷|يوفّر / ينقذ|To keep something for later; to help someone in danger.|I save money in my piggy bank.|5|act
choose|v|👆|يختار|To pick one from many.|Choose a color.|5|act
explain|v|🗨️|يشرح|To tell someone about something so they understand it.|Can you explain the question?|5|act
describe|v|📝|يصف|To say what someone or something is like.|Describe your best friend.|5|act
measure|v|📏|يقيس|To find the size, length or amount of something.|Measure the table with a ruler.|5|act
planet|n|🪐|كوكب|A very big round thing that moves around a star.|Earth is a planet.|4|sci
space|n|🌌|الفضاء|The place outside Earth where the stars and planets are.|Astronauts travel into space.|4|sci
rocket|n|🚀|صاروخ|A vehicle that flies into space.|The rocket went to the moon.|4|sci
telescope|n|🔭|تلسكوب / مقراب|A tool that makes far things look closer.|I saw the moon with a telescope.|5|sci
microscope|n|🔬|مجهر|A tool that makes very small things look bigger.|Look at the leaf under the microscope.|5|sci
magnet|n|🧲|مغناطيس|A piece of metal that pulls iron toward it.|The magnet picked up the nails.|5|sci
energy|n|⚡|طاقة|The power to do work or make things move.|Food gives us energy.|5|sci
electricity|n|🔌|كهرباء|Power that makes lamps and machines work.|The TV uses electricity.|5|sci
experiment|n|🧪|تجربة علمية|A test to find out something in science.|We did an experiment with water.|5|sci
oxygen|n|🫁|أكسجين|A gas in the air that we need to breathe.|Plants give us oxygen.|5|sci
germ|n|🦠|جرثومة|A tiny living thing that can make you sick.|Wash your hands to kill germs.|5|sci
heat|n|🔥|حرارة|The feeling of something being hot.|The sun gives us light and heat.|5|sci
light|n|💡|ضوء|What lets us see; it comes from the sun or a lamp.|Plants need light to grow.|4|sci
shadow|n|👤|ظل|A dark shape made when something blocks light.|My shadow is long in the evening.|5|sci
ice|n|🧊|جليد|Water that is frozen.|Ice melts in the sun.|4|sci
melt|v|🫠|يذوب|To change from solid to liquid because of heat.|The ice cream melted.|5|sci
recycle|v|♻️|يعيد التدوير|To use old things again to make new things.|We recycle paper and bottles.|5|sci
computer|n|💻|حاسوب|A machine that stores information and runs programs.|I use the computer for homework.|4|sci
phone|n|📱|هاتف|You use it to call people.|Mom is on the phone.|3|sci
tablet|n|📲|جهاز لوحي|A flat computer you touch with your finger.|I read stories on my tablet.|4|sci
internet|n|🌐|الإنترنت|A network that connects computers around the world.|We searched on the internet.|5|sci
robot|n|🤖|روبوت / إنسان آلي|A machine that can do jobs by itself.|The robot can clean the floor.|4|sci
screen|n|🖥️|شاشة|The flat glass part of a TV, phone or computer.|Don't sit too close to the screen.|5|sci
red|adj|🔴|أحمر|The color of blood or a tomato.|The apple is red.|3|col
blue|adj|🔵|أزرق|The color of the sky on a sunny day.|The sea is blue.|3|col
green|adj|🟢|أخضر|The color of grass.|Leaves are green.|3|col
yellow|adj|🟡|أصفر|The color of the sun or a banana.|The banana is yellow.|3|col
black|adj|⚫|أسود|The darkest color, like the night sky.|My cat is black.|3|col
white|adj|⚪|أبيض|The color of milk or snow.|Snow is white.|3|col
brown|adj|🟤|بني|The color of chocolate or wood.|The bear is brown.|3|col
purple|adj|🟣|بنفسجي|A color made by mixing red and blue.|Grapes can be purple.|4|col
pink|adj|🩷|وردي|A light red color.|She has a pink bag.|3|col
grey|adj|🩶|رمادي|A color between black and white.|Elephants are grey.|4|col
circle|n|⚪|دائرة|A round shape.|Draw a circle.|3|col
square|n|🟥|مربع|A shape with four equal sides.|The window is a square.|3|col
triangle|n|🔺|مثلث|A shape with three sides.|A triangle has three corners.|3|col
rectangle|n|▭|مستطيل|A shape with four sides; two are long and two are short.|The door is a rectangle.|4|col
star|n|⭐|نجمة (شكل)|A shape with five or more points.|Draw a star on the card.|3|col
heart|n|💗|قلب (شكل)|A shape that means love.|She drew a heart.|3|col
`;

/* ---------- second batch of words ---------- */
APPDATA.dict.RAW += `
son|n|👦|ابن|A boy child of a mother and father.|Their son is five years old.|4|fam
daughter|n|👧|ابنة|A girl child of a mother and father.|They have one daughter.|4|fam
husband|n|🤵|زوج|The man a woman is married to.|Her husband is a doctor.|5|fam
wife|n|👰|زوجة|The woman a man is married to.|His wife is a teacher.|5|fam
grandparents|n|👴👵|الأجداد|Your grandmother and grandfather.|I love visiting my grandparents.|4|fam
nephew|n|👦|ابن الأخ / ابن الأخت|The son of your brother or sister.|My nephew is very small.|5|fam
niece|n|👧|بنت الأخ / بنت الأخت|The daughter of your brother or sister.|My niece likes dolls.|5|fam
adult|n|🧑|شخص بالغ|A grown-up person.|Ask an adult for help.|5|fam
person|n|🧍|شخص|One man, woman or child.|She is a kind person.|4|fam
name|n|🏷️|اسم|What we call someone or something.|My name is Fahad.|3|fam
classmate|n|🧑‍🤝‍🧑|زميل الصف|A student in the same class as you.|My classmate sits next to me.|5|fam
leader|n|🧭|قائد|A person who guides a group.|He is the leader of our team.|5|fam
king|n|🤴|ملك|A man who rules a country.|The king visited our city.|4|fam
queen|n|👸|ملكة|A woman who rules a country, or the wife of a king.|The queen wore a crown.|4|fam
prince|n|🤴|أمير|The son of a king or queen, or a ruler of an area.|The prince opened the new school.|5|fam
hero|n|🦸|بطل|A brave person who helps others.|The firefighter is a hero.|5|fam
stranger|n|🕵️|شخص غريب|A person you do not know.|Don't talk to strangers.|5|fam
lip|n|👄|شفة|One of the two soft edges of your mouth.|My lips are dry.|4|body
tongue|n|👅|لسان|The soft part inside your mouth that you taste with.|Show me your tongue.|4|body
chin|n|🧔|ذقن|The part of your face below your mouth.|He has a beard on his chin.|5|body
cheek|n|😊|خد|The soft part of your face below your eye.|Her cheeks are red.|5|body
eyebrow|n|🤨|حاجب|The line of hair above your eye.|He raised his eyebrows.|5|body
back|n|🧍|ظهر|The part of your body behind you, from your neck to your waist.|Sit with your back straight.|4|body
chest|n|🫁|صدر|The front part of your body between your neck and stomach.|Your heart is in your chest.|5|body
toe|n|🦶|إصبع القدم|One of the five small parts at the end of your foot.|I hurt my toe.|4|body
thumb|n|👍|إبهام|The short thick finger on your hand.|Give me a thumbs up!|5|body
elbow|n|💪|كوع / مرفق|The middle part of your arm that bends.|Don't put your elbows on the table.|5|body
wrist|n|⌚|رسغ|The part between your hand and your arm.|I wear my watch on my wrist.|5|body
nail|n|💅|ظفر|The hard part at the end of a finger or toe.|Cut your nails every week.|5|body
lungs|n|🫁|رئتان|The two parts inside your chest that you breathe with.|Running makes your lungs strong.|5|body
muscle|n|💪|عضلة|A part of your body that helps you move and lift.|Exercise makes your muscles strong.|5|body
body|n|🧍|جسم|All of a person or animal.|Wash your body every day.|3|body
voice|n|🗣️|صوت (الإنسان)|The sound you make when you speak or sing.|She has a lovely voice.|5|body
cold|n|🤧|زكام|A small illness that makes your nose run.|I have a cold today.|4|body
cut|n|🩹|جرح|A small opening in your skin made by something sharp.|Put a plaster on the cut.|4|body
pain|n|😣|ألم|The feeling when part of your body hurts.|I have a pain in my leg.|5|body
toothache|n|🦷|ألم الأسنان|A pain in your tooth.|Too many sweets can give you a toothache.|5|body
exercise|n|🤸|تمرين رياضي|Moving your body to stay healthy.|Exercise is good for your heart.|4|body
hurt|v|🤕|يؤلم / يجرح|To feel pain, or to cause pain.|My foot hurts.|4|body
breathe|v|😮‍💨|يتنفس|To take air into your body and let it out.|Breathe slowly and relax.|5|body
see|v|👁️|يرى|To use your eyes.|I can see the sea.|3|body
hear|v|👂|يسمع|To get sounds with your ears.|I hear a bird.|3|body
smell|v|👃|يشمّ|To notice something with your nose.|The flowers smell nice.|4|body
taste|v|👅|يتذوق|To notice the flavor of food with your tongue.|Taste this soup.|4|body
touch|v|👆|يلمس|To put your hand or finger on something.|Don't touch the hot pan.|4|body
peach|n|🍑|خوخ|A soft round fruit with fuzzy skin.|This peach is juicy.|4|food
pear|n|🍐|كمثرى|A sweet green or yellow fruit, wide at the bottom.|I ate a pear.|4|food
pineapple|n|🍍|أناناس|A big tropical fruit with spiky skin.|Pineapple is sweet and sour.|4|food
cherry|n|🍒|كرز|A small round red fruit with a stone inside.|The cake has a cherry on top.|4|food
coconut|n|🥥|جوز الهند|A big hard brown fruit with white food and juice inside.|Coconuts grow on palm trees.|5|food
kiwi|n|🥝|كيوي|A small brown fruit that is green inside.|Kiwi has lots of vitamin C.|4|food
melon|n|🍈|شمام|A big round fruit that is sweet and juicy.|We ate melon after lunch.|4|food
pomegranate|n|🔴|رمان|A round red fruit with many juicy seeds inside.|I like pomegranate juice.|5|food
fig|n|🟣|تين|A small soft sweet fruit.|We picked figs from the tree.|5|food
olive|n|🫒|زيتون|A small green or black fruit that gives oil.|I eat olives with cheese.|4|food
corn|n|🌽|ذرة|A tall plant with yellow seeds that we eat.|We had corn at the beach.|4|food
peas|n|🟢|بازلاء|Small round green vegetables.|Peas are green and small.|5|food
beans|n|🫘|فاصوليا / فول|Seeds we cook and eat.|We eat beans for breakfast.|4|food
lettuce|n|🥬|خس|A green leafy vegetable used in salads.|Wash the lettuce well.|5|food
pepper|n|🫑|فلفل|A vegetable that can be green, red or yellow; or a spicy powder.|Add some pepper.|4|food
garlic|n|🧄|ثوم|A small white vegetable with a strong taste.|Garlic has a strong smell.|5|food
mushroom|n|🍄|فطر / مشروم|A plant-like thing with a round top, some can be eaten.|I like mushroom soup.|5|food
eggplant|n|🍆|باذنجان|A long purple vegetable.|Mom cooked eggplant with rice.|5|food
broccoli|n|🥦|بروكلي|A green vegetable that looks like a small tree.|Broccoli is good for you.|4|food
spinach|n|🥬|سبانخ|A vegetable with dark green leaves.|Spinach makes you strong.|5|food
butter|n|🧈|زبدة|A soft yellow food made from milk.|Spread butter on the bread.|4|food
yogurt|n|🥛|لبن زبادي|A thick white food made from milk.|I eat yogurt with fruit.|4|food
flour|n|🌾|طحين|White powder from wheat used to make bread and cakes.|We need flour for the cake.|5|food
oil|n|🫗|زيت|A liquid used for cooking.|Fry the eggs in a little oil.|4|food
jam|n|🍓|مربى|A sweet food made from fruit and sugar.|I like strawberry jam on bread.|4|food
pasta|n|🍝|معكرونة|A food made from flour and water, like spaghetti.|We had pasta for dinner.|4|food
burger|n|🍔|برجر|Meat in a round piece of bread.|He ate a burger and fries.|3|food
fries|n|🍟|بطاطس مقلية|Thin pieces of fried potato.|Can I have some fries?|3|food
noodles|n|🍜|نودلز|Long thin strips of food made from flour.|I eat noodles with chopsticks.|4|food
cereal|n|🥣|حبوب الإفطار|Food made from grains that you eat with milk.|I eat cereal for breakfast.|4|food
snack|n|🥨|وجبة خفيفة|A small amount of food between meals.|An apple is a healthy snack.|4|food
meal|n|🍽️|وجبة|Breakfast, lunch or dinner.|We have three meals a day.|4|food
dessert|n|🍮|حلوى (بعد الطعام)|Sweet food you eat after a meal.|We had ice cream for dessert.|5|food
candy|n|🍬|حلوى|A small sweet food made with sugar.|Too much candy is bad for your teeth.|4|food
nuts|n|🥜|مكسرات|Dry seeds with a hard shell that we eat.|Nuts are a healthy snack.|5|food
coffee|n|☕|قهوة|A hot brown drink.|Grandpa drinks Arabic coffee.|4|food
lemonade|n|🍋|عصير ليمون|A drink made from lemons, sugar and water.|Lemonade is cold and fresh.|5|food
bottle|n|🍾|زجاجة / قارورة|A container for drinks with a narrow top.|A bottle of water, please.|4|food
glass|n|🥛|كأس / زجاج|A cup made of glass; also the hard clear material.|Pour milk into the glass.|4|food
bowl|n|🥣|وعاء|A deep round dish for soup or cereal.|A bowl of soup.|4|food
sweet|adj|🍭|حلو المذاق|Tasting of sugar.|Dates are sweet.|4|food
sour|adj|🍋|حامض|Tasting like a lemon.|Lemons are sour.|5|food
salty|adj|🧂|مالح|Tasting of salt.|Sea water is salty.|5|food
spicy|adj|🌶️|حار (طعام)|Hot in your mouth because of pepper.|This food is too spicy.|5|food
fresh|adj|🥬|طازج|Newly made or picked; not old.|We buy fresh bread every day.|5|food
fried|adj|🍳|مقلي|Cooked in hot oil.|I like fried eggs.|5|food
eat out|v|🍽️|يأكل خارج المنزل|To eat at a restaurant.|We eat out on Fridays.|5|food
lamb|n|🐑|خروف صغير / لحم ضأن|A young sheep, or its meat.|The lamb is jumping in the field.|4|ani
puppy|n|🐶|جرو|A baby dog.|The puppy is playing with a ball.|4|ani
kitten|n|🐱|قطة صغيرة|A baby cat.|The kitten drinks milk.|4|ani
chick|n|🐥|كتكوت|A baby chicken.|The chick came out of the egg.|4|ani
calf|n|🐄|عجل|A baby cow.|The calf stays close to its mother.|5|ani
donkey|n|🫏|حمار|An animal like a small horse with long ears.|The donkey carries heavy bags.|4|ani
parrot|n|🦜|ببغاء|A colorful bird that can copy words.|My parrot can say hello.|4|ani
pigeon|n|🕊️|حمامة|A grey bird often seen in cities.|Pigeons are eating seeds.|5|ani
peacock|n|🦚|طاووس|A bird with very big colorful tail feathers.|The peacock opened its tail.|5|ani
falcon|n|🦅|صقر|A fast bird that hunts; it is loved in Saudi Arabia.|My uncle has a falcon.|4|ani
ostrich|n|🦤|نعامة|A very big bird that cannot fly but runs fast.|The ostrich runs very fast.|5|ani
flamingo|n|🦩|طائر النحام (الفلامنجو)|A pink bird with long thin legs.|Flamingos stand on one leg.|5|ani
swan|n|🦢|بجعة / إوزة عراقية|A big white bird with a long neck.|A swan is on the lake.|5|ani
crow|n|🐦‍⬛|غراب|A big black bird.|The crow is very clever.|5|ani
bat|n|🦇|خفاش|A small animal that flies at night.|Bats sleep in the day.|4|ani
squirrel|n|🐿️|سنجاب|A small animal with a big tail that lives in trees.|The squirrel is eating a nut.|5|ani
hedgehog|n|🦔|قنفذ|A small animal covered with sharp spines.|A hedgehog rolls into a ball.|5|ani
kangaroo|n|🦘|كنغر|An animal that jumps and carries its baby in a pouch.|Kangaroos live in Australia.|4|ani
koala|n|🐨|كوالا|A grey animal from Australia that lives in trees.|The koala is sleeping in the tree.|5|ani
panda|n|🐼|باندا|A big black and white bear.|Pandas eat bamboo.|4|ani
cheetah|n|🐆|فهد|A wild cat that is the fastest land animal.|A cheetah runs very fast.|5|ani
leopard|n|🐆|نمر مرقط|A big wild cat with spots.|The leopard climbed the tree.|5|ani
hippo|n|🦛|فرس النهر|A very big animal that lives in rivers.|The hippo has a huge mouth.|4|ani
rhino|n|🦏|وحيد القرن|A big grey animal with a horn on its nose.|The rhino has thick skin.|5|ani
gorilla|n|🦍|غوريلا|A very big strong ape.|The gorilla beats its chest.|5|ani
deer|n|🦌|غزال / أيل|A fast animal; the males have antlers.|We saw a deer in the forest.|5|ani
gazelle|n|🦌|غزال|A small fast animal that lives in the desert and grasslands.|The gazelle ran away quickly.|5|ani
scorpion|n|🦂|عقرب|A small desert animal with a stinger in its tail.|Be careful of scorpions in the desert.|5|ani
lizard|n|🦎|سحلية|A small animal with four legs, a long tail and dry skin.|A lizard is sitting on the rock.|5|ani
fly|n|🪰|ذبابة|A small insect with wings.|A fly is on the window.|4|ani
mosquito|n|🦟|بعوضة|A small flying insect that bites.|Mosquitoes can carry diseases.|5|ani
ladybird|n|🐞|خنفساء الدعسوقة|A small red insect with black spots.|A ladybird landed on my hand.|5|ani
worm|n|🪱|دودة|A long thin soft animal with no legs.|Birds eat worms.|4|ani
snail|n|🐌|حلزون|A small slow animal with a shell on its back.|The snail is very slow.|4|ani
crab|n|🦀|سرطان البحر|A sea animal with a hard shell and two claws.|A crab walks sideways.|4|ani
jellyfish|n|🪼|قنديل البحر|A soft sea animal that can sting.|Don't touch the jellyfish.|5|ani
seal|n|🦭|فقمة|A sea animal with smooth fur that swims well.|The seal is lying on the ice.|5|ani
starfish|n|⭐|نجم البحر|A sea animal shaped like a star.|I found a starfish on the beach.|5|ani
fur|n|🧸|فرو|The soft thick hair on some animals.|The cat has soft fur.|5|ani
horn|n|🦏|قرن|A hard pointed part on the head of some animals.|The goat has two horns.|5|ani
shell|n|🐚|صدفة|The hard outside part of some animals or eggs.|I found a shell on the beach.|4|ani
cage|n|🪺|قفص|A box with bars to keep a bird or animal in.|The bird is in a cage.|5|ani
wild|adj|🐅|بري / متوحش|Living in nature, not with people.|Lions are wild animals.|5|ani
hotel|n|🏨|فندق|A building where you pay to sleep when you travel.|We stayed at a hotel in Jeddah.|4|home
flat|n|🏢|شقة|A home on one floor of a big building.|We live in a flat.|5|home
home|n|🏡|بيت / منزل|The place where you live.|I go home after school.|3|home
tent|n|⛺|خيمة|A shelter made of cloth that you sleep in outside.|We slept in a tent in the desert.|4|home
cupboard|n|🗄️|خزانة|Furniture with doors where you keep things.|The cups are in the cupboard.|4|home
shelf|n|📚|رف|A flat board on a wall to put things on.|The books are on the shelf.|5|home
carpet|n|🟥|سجادة|A thick cover for the floor.|The carpet is soft.|4|home
curtain|n|🪟|ستارة|Cloth that hangs over a window.|Close the curtains at night.|5|home
blanket|n|🛏️|بطانية|A warm cover for your bed.|I sleep under a warm blanket.|4|home
sink|n|🚰|مغسلة|A bowl with a tap where you wash.|Put the dishes in the sink.|5|home
shower|n|🚿|دُش|Water that falls on you to wash your body.|I take a shower every day.|4|home
bath|n|🛁|حوض الاستحمام|A long container you sit in to wash.|The baby is in the bath.|4|home
toilet|n|🚽|مرحاض|The seat in the bathroom you use to go to the toilet.|Flush the toilet.|4|home
television|n|📺|تلفاز|A machine that shows programs and pictures with sound.|We watched television.|3|home
radio|n|📻|مذياع / راديو|A machine you listen to news and music on.|Dad listens to the radio in the car.|5|home
fan|n|🪭|مروحة|A machine that moves air to keep you cool.|Turn on the fan, it's hot.|4|home
air conditioner|n|❄️|مكيف|A machine that makes a room cool.|Turn on the air conditioner.|5|home
washing machine|n|🧺|غسالة|A machine that washes clothes.|Put your socks in the washing machine.|5|home
bin|n|🗑️|سلة المهملات|A container for rubbish.|Throw the paper in the bin.|4|home
gate|n|🚧|بوابة|A door in a wall or fence.|Close the gate.|5|home
fence|n|🚧|سور / سياج|A wall made of wood or metal around a garden.|The dog jumped over the fence.|5|home
basket|n|🧺|سلة|A container made of thin pieces woven together.|Put the apples in the basket.|4|home
bucket|n|🪣|دلو|A round container with a handle for water.|Fill the bucket with water.|5|home
pan|n|🍳|مقلاة|A metal pot for cooking.|Mom is cooking eggs in a pan.|5|home
pot|n|🍲|قِدر|A deep round container for cooking.|The rice is in the pot.|5|home
candle|n|🕯️|شمعة|A stick of wax that you burn to give light.|Blow out the candles!|4|home
brush|n|🖌️|فرشاة|A tool with hairs for painting, cleaning or tidying hair.|Paint with a brush.|4|home
comb|n|🪮|مشط|A tool with teeth to tidy your hair.|Use a comb for your hair.|5|home
toothbrush|n|🪥|فرشاة أسنان|A small brush for cleaning teeth.|My toothbrush is blue.|4|home
toothpaste|n|🦷|معجون أسنان|A paste you put on your toothbrush.|Put toothpaste on your toothbrush.|5|home
umbrella|n|☂️|مظلة|You hold it over your head when it rains.|Take your umbrella.|4|home
phone call|n|📞|مكالمة هاتفية|Talking to someone on the phone.|I made a phone call to my grandma.|5|home
broom|n|🧹|مكنسة|A brush with a long handle to clean floors.|Sweep the floor with a broom.|5|home
balloon|n|🎈|بالون|A rubber bag filled with air.|The balloon flew away.|4|home
gift|n|🎁|هدية|Something you give to someone.|Thank you for the gift.|4|home
doll|n|🪆|دمية|A toy that looks like a person.|My sister has a doll.|4|home
teddy bear|n|🧸|دبدوب|A soft toy bear.|I sleep with my teddy bear.|4|home
headteacher|n|🧑‍💼|مدير المدرسة|The person in charge of a school.|The headteacher spoke to the students.|5|sch
subject|n|📚|مادة دراسية|Something you study at school, like math or science.|My favorite subject is science.|5|sch
history|n|🏛️|تاريخ|The study of things that happened long ago.|We learn history at school.|5|sch
geography|n|🗺️|جغرافيا|The study of countries, land and seas.|In geography we studied maps.|5|sch
map|n|🗺️|خريطة|A drawing of an area, a country or the world.|Find Riyadh on the map.|4|sch
globe|n|🌐|مجسم الكرة الأرضية|A round model of the Earth.|The teacher showed us the globe.|5|sch
sharpener|n|✏️|مبراة|A tool that makes a pencil sharp.|I need a sharpener.|4|sch
pencil case|n|🖍️|مقلمة|A small bag or box for pens and pencils.|My pencil case is full.|4|sch
marker|n|🖊️|قلم تخطيط|A pen with a thick tip.|Write on the board with a marker.|5|sch
calculator|n|🧮|آلة حاسبة|A small machine that does math.|Use a calculator to check your answer.|5|sch
story|n|📖|قصة|Words that tell about things that happened, real or not.|Dad read me a story.|3|sch
poem|n|📜|قصيدة|Words written in lines, often with rhymes.|We learned a poem by heart.|5|sch
alphabet|n|🔤|الحروف الهجائية|All the letters of a language in order.|There are 26 letters in the English alphabet.|4|sch
number|n|🔢|رقم / عدد|A word or sign like 1, 2 or 3.|Write the number five.|3|sch
grade|n|🅰️|صف دراسي / درجة|A school year, or a mark for your work.|I am in grade four.|4|sch
exam|n|📝|امتحان|An important test.|We have an exam next week.|5|sch
project|n|🗂️|مشروع|A big piece of school work.|Our project is about the sea.|5|sch
example|n|💡|مثال|Something that shows what you mean.|Can you give me an example?|5|sch
list|n|📋|قائمة|Words or things written one under another.|Make a shopping list.|4|sch
rule|n|📏|قاعدة|Something that tells you what you must do.|Follow the class rules.|5|sch
correct|adj|✅|صحيح|Right; with no mistakes.|Your answer is correct.|5|sch
wrong|adj|❌|خطأ|Not right.|That answer is wrong. Try again.|4|sch
spell|v|🔡|يتهجّى|To say or write the letters of a word in order.|How do you spell your name?|4|sch
count|v|🔢|يعدّ|To say numbers in order, or find how many.|Count from one to ten.|3|sch
add|v|➕|يجمع / يضيف|To put numbers or things together.|Add two and three.|4|sch
check|v|✔️|يتحقق|To look again to make sure something is right.|Check your answers.|5|sch
copy|v|📄|ينسخ|To write or make the same as something else.|Copy the words from the board.|5|sch
repeat|v|🔁|يكرر|To say or do something again.|Repeat after me.|4|sch
practice|v|🏋️|يتمرّن|To do something many times to get better.|Practice reading every day.|5|sch
understand|v|💡|يفهم|To know what something means.|I understand the lesson.|5|sch
cinema|n|🎬|سينما|A place where you watch films on a big screen.|We went to the cinema.|4|town
mall|n|🛍️|مركز تسوق|A big building with many shops.|We went shopping at the mall.|4|town
market|n|🧺|سوق|A place where people buy and sell food and things.|We buy vegetables at the market.|4|town
post office|n|📮|مكتب البريد|A place where you send letters and packages.|Send the letter from the post office.|5|town
police station|n|🚓|مركز الشرطة|The building where police officers work.|The police station is near the bank.|5|town
fire station|n|🚒|مركز الإطفاء|The building where firefighters and fire engines are.|The fire station has red trucks.|5|town
station|n|🚉|محطة|A place where trains or buses stop.|The bus station is busy.|5|town
gas station|n|⛽|محطة وقود|A place where you buy fuel for a car.|Dad stopped at the gas station.|5|town
clinic|n|🏥|عيادة|A small place where doctors see patients.|I went to the clinic for a checkup.|5|town
university|n|🎓|جامعة|A place where people study after school.|My brother studies at the university.|5|town
stadium|n|🏟️|ملعب كبير|A big place where people watch sports.|We watched the match at the stadium.|5|town
swimming pool|n|🏊|مسبح|A place filled with water to swim in.|We swim in the swimming pool.|4|town
office|n|🏢|مكتب|A room or building where people work at desks.|My father works in an office.|5|town
factory|n|🏭|مصنع|A building where things are made with machines.|Cars are made in a factory.|5|town
castle|n|🏰|قلعة|A big old strong building with towers.|The king lived in a castle.|4|town
tower|n|🗼|برج|A tall thin building.|The tower is very high.|5|town
palace|n|🏯|قصر|A very big beautiful house of a king or queen.|The king lives in a palace.|5|town
corner|n|📐|زاوية / ناصية|The place where two lines, walls or streets meet.|The shop is on the corner.|5|town
traffic light|n|🚦|إشارة مرور|Red, yellow and green lights that control traffic.|Stop at the red traffic light.|4|town
sign|n|🪧|لافتة|A board with words or pictures that tells you something.|Read the sign.|5|town
crosswalk|n|🚸|ممر المشاة|A place on the road where people cross safely.|Cross at the crosswalk.|5|town
world|n|🌍|العالم|The Earth and all the people and places on it.|I want to travel around the world.|4|town
capital|n|🏛️|عاصمة|The main city of a country.|Riyadh is the capital of Saudi Arabia.|5|town
Saudi Arabia|n|🇸🇦|المملكة العربية السعودية|The country of Riyadh, Makkah and Madinah.|I live in Saudi Arabia.|4|town
north|n|⬆️|الشمال|The direction toward the top of a map.|Tabuk is in the north.|5|town
south|n|⬇️|الجنوب|The direction toward the bottom of a map.|Abha is in the south.|5|town
east|n|➡️|الشرق|The direction where the sun comes up.|The sun rises in the east.|5|town
west|n|⬅️|الغرب|The direction where the sun goes down.|The sun sets in the west.|5|town
left|adj|👈|يسار|The side of your body where your heart is.|Turn left at the mosque.|4|town
right|adj|👉|يمين|The opposite side from left.|Raise your right hand.|4|town
near|prep|📍|قريب من|Not far from.|The school is near my house.|4|town
far|adj|🛤️|بعيد|A long way away.|The beach is far from here.|4|town
inside|prep|📥|داخل|In something.|The cat is inside the box.|4|town
outside|prep|📤|خارج|Not inside; out of a building.|Let's play outside.|4|town
between|prep|↔️|بين|In the middle of two things.|Sit between Ali and Omar.|4|town
behind|prep|🔙|خلف|At the back of.|The ball is behind the door.|4|town
in front of|prep|🔜|أمام|Before something, facing it.|The car is in front of the house.|4|town
under|prep|⬇️|تحت|Below something.|The cat is under the table.|3|town
on|prep|⬆️|على|Touching the top of something.|The book is on the desk.|3|town
next to|prep|↔️|بجانب|Very close, at the side of.|My house is next to the park.|4|town
above|prep|⏫|فوق|Higher than something.|The bird is above the tree.|5|town
judge|n|⚖️|قاضٍ|A person who decides things in a court.|The judge listened carefully.|5|job
lawyer|n|👨‍⚖️|محامٍ|A person who helps people with the law.|My uncle is a lawyer.|5|job
soldier|n|💂|جندي|A person who works in the army.|The soldier protects the country.|5|job
baker|n|🧑‍🍳|خبّاز|A person who makes bread and cakes.|The baker gets up very early.|4|job
butcher|n|🔪|جزار|A person who sells meat.|We buy meat from the butcher.|5|job
carpenter|n|🪚|نجار|A person who makes things from wood.|The carpenter made a table.|5|job
plumber|n|🔧|سبّاك|A person who fixes water pipes.|The plumber fixed the sink.|5|job
electrician|n|💡|كهربائي|A person who fixes electric things.|The electrician fixed the lights.|5|job
tailor|n|🪡|خيّاط|A person who makes clothes.|The tailor made my thobe.|5|job
shopkeeper|n|🏪|صاحب المتجر|A person who owns or works in a shop.|The shopkeeper was friendly.|5|job
waiter|n|🍽️|نادل|A person who brings food in a restaurant.|The waiter brought our drinks.|5|job
fisherman|n|🎣|صياد سمك|A person who catches fish.|The fisherman caught a big fish.|5|job
builder|n|👷|عامل بناء|A person who builds houses.|The builder is building a wall.|5|job
writer|n|✍️|كاتب|A person who writes books or stories.|The writer wrote a new book.|5|job
singer|n|🎤|مغنٍّ / منشد|A person who sings.|The singer has a strong voice.|5|job
photographer|n|📸|مصوّر|A person who takes photos.|The photographer took our picture.|5|job
programmer|n|👩‍💻|مبرمج|A person who writes computer programs.|She is a programmer at a big company.|5|job
pharmacist|n|💊|صيدلي|A person who prepares and sells medicine.|Ask the pharmacist about the medicine.|5|job
imam|n|🕌|إمام|The person who leads the prayer in a mosque.|The imam has a beautiful voice.|4|job
principal|n|🧑‍💼|مدير|The person who leads a school.|The principal visited our class.|5|job
work|v|💼|يعمل|To do a job.|My mother works at a hospital.|4|job
van|n|🚐|شاحنة صغيرة / فان|A vehicle bigger than a car, for carrying people or things.|The van carries boxes.|5|trans
ambulance|n|🚑|سيارة إسعاف|A vehicle that takes sick or hurt people to hospital.|The ambulance came quickly.|4|trans
fire engine|n|🚒|سيارة إطفاء|A big red truck that carries firefighters.|The fire engine has a long ladder.|5|trans
police car|n|🚓|سيارة شرطة|A car used by police officers.|A police car stopped by the road.|4|trans
tractor|n|🚜|جرار زراعي|A strong vehicle used on farms.|The farmer drives a tractor.|5|trans
scooter|n|🛴|سكوتر|A small vehicle you push with your foot.|I ride my scooter in the park.|4|trans
skateboard|n|🛹|لوح تزلج|A board with wheels you stand on.|He is good at skateboarding.|5|trans
submarine|n|🛳️|غواصة|A ship that can go under the sea.|A submarine can go very deep.|5|trans
spaceship|n|🛸|مركبة فضائية|A vehicle that travels in space.|The spaceship landed on the moon.|5|trans
seat belt|n|🔒|حزام الأمان|A belt in a car that keeps you safe.|Wear your seat belt.|5|trans
driver's license|n|🪪|رخصة قيادة|A card that says you can drive.|My brother got his driver's license.|5|trans
trip|n|🧳|رحلة|A journey to a place and back.|We went on a school trip.|4|trans
passenger|n|🧑‍🦱|راكب|A person traveling in a car, bus or plane.|The bus has many passengers.|5|trans
drive|v|🚗|يقود (سيارة)|To control a car.|My father drives carefully.|4|trans
ride|v|🚲|يركب|To sit on and move with a bike, horse or bus.|I ride my bike to the park.|4|trans
park|v|🅿️|يركن (السيارة)|To leave a car in a place.|Park the car here.|5|trans
cross|v|🚸|يعبر|To go from one side to the other.|Cross the road carefully.|5|trans
land|v|🛬|يهبط|To come down onto the ground.|The plane will land soon.|5|trans
hill|n|⛰️|تل|A high piece of land, smaller than a mountain.|We ran up the hill.|4|nat
valley|n|🏞️|وادٍ|Low land between hills or mountains.|There is a river in the valley.|5|nat
cave|n|🕳️|كهف|A big hole in the side of a mountain or under the ground.|Bats live in the cave.|5|nat
waterfall|n|🌊|شلال|Water falling from a high place.|The waterfall is very beautiful.|5|nat
wave|n|🌊|موجة|Water that rises and moves in the sea.|The waves are big today.|4|nat
coast|n|🏖️|ساحل|Land next to the sea.|Jeddah is on the coast.|5|nat
oasis|n|🌴|واحة|A place in the desert with water and trees.|Al-Ahsa is a big oasis.|5|nat
palm tree|n|🌴|نخلة|A tall tree with big leaves at the top; dates grow on it.|Dates grow on palm trees.|4|nat
branch|n|🌿|غصن|A part of a tree that grows out from the trunk.|The bird is on the branch.|5|nat
root|n|🌱|جذر|The part of a plant under the ground.|Roots take water from the soil.|5|nat
stem|n|🌱|ساق النبات|The long thin part of a plant that holds the leaves and flowers.|The flower has a long stem.|5|nat
soil|n|🟫|تربة|The top layer of the ground where plants grow.|Plant the seeds in the soil.|5|nat
stone|n|🪨|حجر|A small hard piece of rock.|He threw a stone into the lake.|4|nat
mud|n|🟤|طين|Wet soft earth.|My shoes are covered in mud.|5|nat
dust|n|🌫️|غبار|Very small dry pieces of dirt.|There is dust on the shelf.|5|nat
sandstorm|n|🌪️|عاصفة رملية|Strong wind that carries sand.|Stay inside during a sandstorm.|5|nat
fog|n|🌫️|ضباب|Thick cloud near the ground that makes it hard to see.|Drive slowly in the fog.|5|nat
thunder|n|⛈️|رعد|The loud noise in the sky during a storm.|The thunder was very loud.|5|nat
lightning|n|⚡|برق|A bright flash of light in the sky in a storm.|Lightning lit up the sky.|5|nat
sunrise|n|🌅|شروق الشمس|The time when the sun comes up.|We watched the sunrise.|5|nat
sunset|n|🌇|غروب الشمس|The time when the sun goes down.|The sunset was orange and pink.|5|nat
temperature|n|🌡️|درجة الحرارة|How hot or cold something is.|The temperature is 40 degrees.|5|nat
nature|n|🌿|الطبيعة|Plants, animals, land and everything not made by people.|I love walking in nature.|5|nat
environment|n|🌎|البيئة|The air, water and land around us.|Keep the environment clean.|5|nat
pollution|n|🏭|تلوّث|Dirt or harmful things in the air, water or land.|Cars cause air pollution.|5|nat
cool|adj|🌬️|بارد قليلًا / منعش|A little cold, in a nice way.|The evening is cool.|4|nat
dark|adj|🌑|مظلم / داكن|With little or no light.|It's dark at night.|4|nat
bright|adj|🔆|ساطع / مشرق|Full of light.|The sun is very bright.|5|nat
shine|v|☀️|يلمع / يسطع|To give out light.|The sun shines in the sky.|5|nat
blow|v|💨|يهبّ / ينفخ|To move air.|The wind blows hard.|5|nat
freeze|v|🧊|يتجمد|To become ice because it is very cold.|Water freezes at zero degrees.|5|nat
noon|n|🕛|الظهر|Twelve o'clock in the middle of the day.|We pray Dhuhr at noon.|4|time
midnight|n|🕛|منتصف الليل|Twelve o'clock at night.|Everyone is asleep at midnight.|5|time
second|n|⏱️|ثانية|A very short time; 60 make a minute.|Wait one second.|5|time
o'clock|adv|🕐|الساعة (تمامًا)|Used to say an exact hour.|School starts at seven o'clock.|4|time
time|n|⌚|وقت|What a clock tells us; hours and minutes.|What time is it?|3|time
date|n|📅|تاريخ (اليوم)|The day, month and year.|What is the date today?|5|time
Sunday|n|📅|الأحد|The first day of the school week in Saudi Arabia.|School starts on Sunday.|3|time
Monday|n|📅|الإثنين|The day after Sunday.|We have art on Monday.|3|time
Tuesday|n|📅|الثلاثاء|The day after Monday.|I go swimming on Tuesday.|3|time
Wednesday|n|📅|الأربعاء|The day after Tuesday.|Wednesday is in the middle of the week.|4|time
Thursday|n|📅|الخميس|The day after Wednesday.|Thursday is the last school day of the week.|3|time
Friday|n|📅|الجمعة|The day after Thursday; Muslims pray Jumu'ah.|We go to the mosque on Friday.|3|time
Saturday|n|📅|السبت|The day after Friday.|We visit my aunt on Saturday.|3|time
January|n|🗓️|يناير|The first month of the year.|It is cold in January.|4|time
February|n|🗓️|فبراير|The second month of the year.|February is a short month.|4|time
March|n|🗓️|مارس|The third month of the year.|Spring starts in March.|4|time
April|n|🗓️|أبريل|The fourth month of the year.|My birthday is in April.|4|time
May|n|🗓️|مايو|The fifth month of the year.|It gets hot in May.|4|time
June|n|🗓️|يونيو|The sixth month of the year.|School ends in June.|4|time
July|n|🗓️|يوليو|The seventh month of the year.|July is very hot.|4|time
August|n|🗓️|أغسطس|The eighth month of the year.|We travel in August.|4|time
September|n|🗓️|سبتمبر|The ninth month of the year.|National Day is in September.|4|time
October|n|🗓️|أكتوبر|The tenth month of the year.|The weather is nicer in October.|4|time
November|n|🗓️|نوفمبر|The eleventh month of the year.|We go camping in November.|4|time
December|n|🗓️|ديسمبر|The twelfth and last month of the year.|December is in winter.|4|time
past|n|⏪|الماضي|The time before now.|In the past, people rode camels.|5|time
future|n|⏩|المستقبل|The time after now.|In the future I want to be a pilot.|5|time
now|adv|⏺️|الآن|At this time.|Do your homework now.|3|time
soon|adv|⏳|قريبًا|In a short time.|Dinner will be ready soon.|4|time
later|adv|🔜|لاحقًا|After some time.|See you later!|4|time
usually|adv|🔁|عادةً|Most of the time.|I usually walk to school.|5|time
often|adv|🔂|غالبًا|Many times.|I often read before bed.|5|time
again|adv|🔁|مرة أخرى|One more time.|Say it again, please.|4|time
before|prep|⬅️|قبل|Earlier than.|Wash your hands before lunch.|4|time
after|prep|➡️|بعد|Later than.|We play after school.|4|time
volleyball|n|🏐|كرة الطائرة|A game where teams hit a ball over a high net.|We play volleyball on the beach.|5|sport
cycling|n|🚴|ركوب الدراجات|Riding a bike as a sport.|Cycling is good exercise.|5|sport
karate|n|🥋|كاراتيه|A sport where you fight using hands and feet.|My brother has a karate belt.|5|sport
horse riding|n|🏇|ركوب الخيل|Riding a horse as a sport.|Horse riding is fun.|5|sport
camping|n|🏕️|التخييم|Staying outside in a tent.|We go camping in the desert.|5|sport
fishing|n|🎣|صيد السمك|Catching fish.|Dad and I went fishing.|5|sport
painting|n|🎨|الرسم بالألوان|Making pictures with paint.|Painting is my hobby.|4|sport
cooking|n|🍳|الطبخ|Making food.|My sister loves cooking.|5|sport
gardening|n|🌻|البستنة|Growing plants in a garden.|Grandma likes gardening.|5|sport
video game|n|🎮|لعبة فيديو|A game you play on a screen.|Don't play video games for too long.|4|sport
match|n|🏟️|مباراة|A game between two teams or players.|We won the match 3–1.|4|sport
player|n|🧑‍🦱|لاعب|A person who plays a game or sport.|He is a good football player.|4|sport
coach|n|🧑‍🏫|مدرب|A person who trains a team.|Our coach is very strict.|5|sport
prize|n|🏅|جائزة|Something you get for winning.|She won first prize.|5|sport
medal|n|🥇|ميدالية|A round metal prize for winning.|He won a gold medal.|5|sport
cup|n|🏆|كأس (جائزة)|A prize for the winning team.|Our team won the cup.|4|sport
score|v|🥅|يسجّل (هدفًا)|To get a goal or point in a game.|He scored two goals.|5|sport
draw|n|🤝|تعادل|When a game ends with the same score.|The match ended in a draw.|5|sport
helmet|n|⛑️|خوذة|A hard hat that keeps your head safe.|Wear a helmet when you ride a bike.|5|sport
net|n|🥅|شبكة|Material with holes, used in sports and fishing.|The ball hit the net.|5|sport
fun|n|🎉|متعة|Enjoying yourself.|We had fun at the park.|4|sport
party|n|🥳|حفلة|A time when people meet to eat and have fun.|I'm invited to a birthday party.|4|sport
song|n|🎵|أغنية / نشيد|Words you sing with music.|We sang a song in class.|4|sport
film|n|🎬|فيلم|A story you watch on a screen.|We watched a funny film.|4|sport
cartoon|n|📺|رسوم متحركة|A film with drawings that move.|My brother watches cartoons.|4|sport
toy car|n|🚗|سيارة لعبة|A small car to play with.|I have a red toy car.|3|sport
hide|v|🙈|يختبئ|To go where no one can see you.|Let's play hide and seek.|4|sport
dance|v|💃|يرقص|To move your body to music.|The children danced happily.|5|sport
collect|v|🗃️|يجمع (يقتني)|To get and keep things of one kind.|I collect stamps.|5|sport
thobe|n|👘|ثوب|A long white dress for men and boys in Saudi Arabia.|My father wears a white thobe.|4|clo
abaya|n|🧕|عباءة|A long black dress worn over clothes by women.|My mother wears an abaya.|4|clo
shemagh|n|🧣|شماغ|A red and white head cloth worn by men in Saudi Arabia.|Grandpa wears a shemagh.|5|clo
sweater|n|🧶|كنزة صوف|A warm top made of wool.|Wear a sweater, it's cold.|4|clo
T-shirt|n|👕|تي شيرت|A shirt with short sleeves and no collar.|I have a blue T-shirt.|3|clo
jeans|n|👖|جينز|Trousers made of strong blue cloth.|He wears jeans.|4|clo
shorts|n|🩳|شورت|Short trousers.|I wear shorts to play football.|4|clo
pajamas|n|🛌|ملابس النوم|Clothes you wear to sleep.|Put on your pajamas.|4|clo
boots|n|🥾|حذاء طويل|Shoes that cover your foot and part of your leg.|Wear boots in the rain.|4|clo
sandals|n|🩴|صندل|Open shoes for hot weather.|I wear sandals in summer.|4|clo
slippers|n|🥿|خُف / شبشب|Soft shoes you wear at home.|Put on your slippers.|5|clo
belt|n|🪢|حزام|A strip you wear around your waist.|My belt is brown.|4|clo
tie|n|👔|ربطة عنق|A long cloth worn around the neck with a shirt.|Dad wears a tie to work.|5|clo
button|n|🔘|زر|A small round thing that closes clothes.|A button fell off my shirt.|5|clo
ring|n|💍|خاتم|A circle of metal you wear on your finger.|She has a gold ring.|4|clo
necklace|n|📿|عقد|Jewelry you wear around your neck.|Her necklace is very pretty.|5|clo
wallet|n|👛|محفظة|A small case for money and cards.|Dad's wallet is in his pocket.|5|clo
wear|v|👕|يرتدي / يلبس|To have clothes on your body.|I wear a uniform to school.|4|clo
put on|v|🧥|يلبس|To start wearing clothes.|Put on your jacket.|4|clo
take off|v|👟|يخلع|To remove clothes.|Take off your shoes at the door.|4|clo
size|n|📏|مقاس / حجم|How big something is.|What size are your shoes?|5|clo
calm|adj|😌|هادئ|Not worried or excited.|Stay calm and breathe.|5|feel
worried|adj|😟|قلق|Thinking that something bad may happen.|I'm worried about the test.|5|feel
nervous|adj|😬|متوتر|A little afraid about something.|I was nervous before the race.|5|feel
lonely|adj|😔|وحيد|Sad because you are alone.|The new boy felt lonely.|5|feel
shy|adj|😳|خجول|Not comfortable talking to new people.|My sister is shy.|5|feel
friendly|adj|🙂|ودود|Kind and nice to others.|Our neighbors are friendly.|4|feel
clever|adj|🧠|ذكي|Quick to learn and understand.|She is a clever girl.|4|feel
smart|adj|🤓|ذكي|Clever; good at learning.|You are smart!|4|feel
lazy|adj|🦥|كسول|Not wanting to work.|Don't be lazy, do your homework.|5|feel
busy|adj|🏃|مشغول|Having lots to do.|Mom is busy now.|5|feel
helpful|adj|🤝|مفيد / متعاون|Ready to help.|My brother is very helpful.|5|feel
honest|adj|🤞|صادق / أمين|Always telling the truth.|An honest person doesn't lie.|5|feel
patient|adj|⏳|صبور|Able to wait without getting angry.|Be patient, the bus is coming.|5|feel
careful|adj|⚠️|حذر|Thinking about what you do so you don't make mistakes.|Be careful with the knife.|5|feel
cute|adj|🥰|لطيف (شكلًا)|Pretty and sweet.|The kitten is so cute.|4|feel
ugly|adj|👹|قبيح|Not nice to look at.|The monster is ugly.|5|feel
pretty|adj|🌸|جميل / جميلة|Nice to look at.|What a pretty dress!|4|feel
rich|adj|💰|غني|Having a lot of money.|The rich man helped the poor.|5|feel
poor|adj|🪙|فقير|Having very little money.|We give food to poor people.|5|feel
good|adj|👍|جيد|Nice, right or well done.|Good job!|3|feel
bad|adj|👎|سيئ|Not good.|The weather is bad today.|3|feel
great|adj|🌟|رائع|Very good.|That's a great idea!|4|feel
wonderful|adj|✨|رائع جدًا|Very, very good.|We had a wonderful day.|5|feel
amazing|adj|🤩|مذهل|Very surprising and good.|The show was amazing!|5|feel
terrible|adj|😖|فظيع|Very bad.|The storm was terrible.|5|feel
right|adj|✅|صحيح|Correct; true.|You are right.|4|feel
true|adj|✔️|صحيح / حقيقي|Real; not a lie.|Is it true?|5|feel
real|adj|💯|حقيقي|Not pretend.|Is that a real snake?|5|feel
open|adj|📂|مفتوح|Not closed.|The shop is open.|4|feel
closed|adj|🔒|مغلق|Not open.|The door is closed.|4|feel
cheap|adj|🏷️|رخيص|Costing little money.|This toy is cheap.|5|feel
expensive|adj|💎|غالٍ|Costing a lot of money.|That car is expensive.|5|feel
fat|adj|🐷|سمين|Having a big round body.|The cat is too fat.|4|feel
thin|adj|🥢|نحيف / رقيق|Not thick or not fat.|The pencil is thin.|4|feel
thick|adj|📕|سميك|Wide from one side to the other.|This book is very thick.|5|feel
wide|adj|↔️|واسع / عريض|Big from side to side.|The road is wide.|5|feel
narrow|adj|🛤️|ضيق|Not wide.|The street is narrow.|5|feel
deep|adj|🌊|عميق|Going far down.|The sea is deep.|5|feel
high|adj|🏔️|مرتفع / عالٍ|Far up from the ground.|The plane is high in the sky.|4|feel
low|adj|⬇️|منخفض|Not high.|The table is low.|5|feel
noisy|adj|🔊|مزعج / صاخب|Making a lot of noise.|The classroom is noisy.|5|feel
busy|adj|🚦|مزدحم|Full of people or cars.|The street is busy.|5|town
tidy|adj|🧹|مرتّب|Neat, with everything in its place.|Keep your room tidy.|5|feel
messy|adj|🌀|فوضوي|Not tidy.|My brother's room is messy.|5|feel
interesting|adj|🤔|ممتع / مثير للاهتمام|Makes you want to know more.|This book is interesting.|5|feel
boring|adj|🥱|ممل|Not interesting.|The film was boring.|5|feel
free|adj|🆓|مجاني / حر|Costs no money; or not busy.|The museum is free on Fridays.|5|feel
ready|adj|✅|جاهز|Prepared to do something.|Are you ready?|4|feel
little|adj|🐣|صغير|Small.|I have a little brother.|3|feel
huge|adj|🦕|ضخم|Very, very big.|Dinosaurs were huge.|5|feel
tiny|adj|🐜|صغير جدًا|Very, very small.|An ant is tiny.|5|feel
feel|v|💗|يشعر|To have a feeling, like happy or sad.|I feel happy today.|4|feel
hug|v|🫂|يعانق|To put your arms around someone.|I hug my mother.|4|act
shout|v|📢|يصرخ|To say something very loudly.|Don't shout in class.|5|act
whisper|v|🤫|يهمس|To speak very quietly.|She whispered a secret.|5|act
call|v|📞|يتصل / ينادي|To phone someone, or say their name loudly.|Call me when you get home.|4|act
show|v|👉|يُري / يعرض|To let someone see something.|Show me your picture.|4|act
tell|v|🗣️|يخبر|To say something to someone.|Tell me a story.|4|act
say|v|💬|يقول|To speak words.|Say thank you.|3|act
send|v|📨|يرسل|To make something go to someone.|Send me a message.|5|act
bring|v|🎒|يُحضر|To take something with you to a place.|Bring your book tomorrow.|4|act
get|v|🫴|يحصل على|To receive or take something.|I got a present.|4|act
put|v|📥|يضع|To move something to a place.|Put your bag here.|4|act
pick up|v|🫳|يلتقط|To lift something up.|Pick up your toys.|4|act
drop|v|⬇️|يُسقط|To let something fall.|Don't drop the glass.|5|act
push|v|🫸|يدفع|To move something away from you.|Push the door.|4|act
pull|v|🫷|يسحب|To move something toward you.|Pull the rope.|4|act
lift|v|🏋️|يرفع|To move something up.|Can you lift this box?|5|act
hold|v|🤲|يمسك|To have something in your hands.|Hold my hand.|4|act
cut|v|✂️|يقص / يقطع|To divide something with a knife or scissors.|Cut the paper in half.|4|act
fix|v|🔧|يصلح|To make something work again.|Dad fixed my bike.|5|act
break|v|💔|يكسر|To make something go into pieces.|Don't break the window.|4|act
mix|v|🥣|يخلط|To put things together and stir.|Mix the eggs and flour.|5|act
pour|v|🫗|يصبّ|To make a liquid flow from a container.|Pour the milk into the cup.|5|act
fill|v|🪣|يملأ|To make something full.|Fill the bottle with water.|5|act
paint|v|🖌️|يلوّن / يطلي|To put colors on something with a brush.|Let's paint the wall.|4|act
color|v|🖍️|يلوّن|To put colors on a picture.|Color the flower red.|3|act
fall|v|🍂|يسقط / يقع|To go down to the ground.|Be careful, don't fall.|4|act
wake up|v|⏰|يستيقظ|To stop sleeping.|I wake up at six.|4|act
get up|v|🛏️|ينهض|To get out of bed.|Get up, it's late!|4|act
go to bed|v|🛌|يذهب إلى السرير|To go and lie down to sleep.|I go to bed at nine.|4|act
have|v|🫴|يملك / لديه|To own something.|I have two sisters.|3|act
make|v|🛠️|يصنع|To create something.|Let's make a cake.|4|act
do|v|✅|يفعل|To carry out an action.|Do your homework.|3|act
use|v|🧰|يستخدم|To do something with a tool or thing.|Use a pencil.|4|act
move|v|📦|يتحرك / ينقل|To go or put something in another place.|Move your chair.|4|act
turn|v|↪️|يدور / ينعطف|To move around, or change direction.|Turn right at the corner.|5|act
follow|v|👣|يتبع|To go after someone.|Follow me, please.|5|act
leave|v|🚪|يغادر / يترك|To go away from a place.|We leave home at seven.|5|act
enter|v|🚪|يدخل|To go into a place.|Enter the room quietly.|5|act
return|v|↩️|يعود / يُرجع|To come or give back.|Return the book to the library.|5|act
meet|v|🤝|يقابل|To come together with someone.|Nice to meet you!|4|act
invite|v|💌|يدعو|To ask someone to come to an event.|I invited my friends to my party.|5|act
thank|v|🙏|يشكر|To say thank you.|Thank your teacher.|4|act
agree|v|👍|يوافق|To think the same as someone.|I agree with you.|5|act
believe|v|💭|يصدّق / يؤمن|To think something is true.|I believe you.|5|act
hope|v|🤞|يأمل|To want something to happen.|I hope it doesn't rain.|5|act
wish|v|🌠|يتمنى|To want something that may be hard to get.|I wish I could fly.|5|act
guess|v|🤔|يخمّن|To give an answer when you are not sure.|Guess what is in the box!|5|act
decide|v|🧭|يقرر|To choose after thinking.|We decided to go to the park.|5|act
happen|v|❗|يحدث|To take place.|What happened?|5|act
change|v|🔄|يغيّر / يتغير|To become different, or make different.|The leaves change color in autumn.|5|act
look for|v|🔎|يبحث عن|To try to find.|I'm looking for my keys.|4|act
look after|v|🤱|يعتني بـ|To take care of.|I look after my little sister.|5|act
take care of|v|🫶|يعتني بـ|To look after.|Take care of your pet.|5|act
protect|v|🛡️|يحمي|To keep safe from danger.|Sun cream protects your skin.|5|act
clap|v|👏|يصفّق|To hit your hands together.|Clap your hands!|4|act
shake|v|🤝|يهزّ / يصافح|To move up and down quickly.|Shake hands with your friend.|5|act
point|v|👉|يشير|To show with your finger.|Point to the door.|5|act
knock|v|✊|يطرق|To hit a door to say you are there.|Knock before you come in.|5|act
ring|v|🔔|يرنّ|To make a bell sound.|The phone is ringing.|5|act
one|n|1️⃣|واحد|The number 1.|I have one nose.|3|num
two|n|2️⃣|اثنان|The number 2.|I have two eyes.|3|num
three|n|3️⃣|ثلاثة|The number 3.|A triangle has three sides.|3|num
four|n|4️⃣|أربعة|The number 4.|A cat has four legs.|3|num
five|n|5️⃣|خمسة|The number 5.|I have five fingers on each hand.|3|num
six|n|6️⃣|ستة|The number 6.|An insect has six legs.|3|num
seven|n|7️⃣|سبعة|The number 7.|There are seven days in a week.|3|num
eight|n|8️⃣|ثمانية|The number 8.|A spider has eight legs.|3|num
nine|n|9️⃣|تسعة|The number 9.|I am nine years old.|3|num
ten|n|🔟|عشرة|The number 10.|I have ten toes.|3|num
eleven|n|🔢|أحد عشر|The number 11.|A football team has eleven players.|4|num
twelve|n|🔢|اثنا عشر|The number 12.|There are twelve months in a year.|4|num
thirteen|n|🔢|ثلاثة عشر|The number 13.|My cousin is thirteen.|4|num
fifteen|n|🔢|خمسة عشر|The number 15.|The lesson is fifteen minutes long.|4|num
twenty|n|🔢|عشرون|The number 20.|There are twenty students in my class.|4|num
thirty|n|🔢|ثلاثون|The number 30.|Ramadan has twenty-nine or thirty days.|4|num
forty|n|🔢|أربعون|The number 40.|It's forty degrees today.|5|num
fifty|n|🔢|خمسون|The number 50.|The book costs fifty riyals.|5|num
hundred|n|💯|مئة|The number 100.|I got a hundred on my test!|4|num
thousand|n|🔢|ألف|The number 1000.|A thousand people were at the match.|5|num
zero|n|0️⃣|صفر|The number 0; nothing.|Zero plus five is five.|4|num
first|adj|🥇|الأول|Number one in order.|I was first in the race.|4|num
second|adj|🥈|الثاني|Number two in order.|She came second.|4|num
third|adj|🥉|الثالث|Number three in order.|He came third.|4|num
last|adj|🔚|الأخير|At the end; after all the others.|Z is the last letter.|4|num
half|n|🌗|نصف|One of two equal parts.|Cut the apple in half.|4|num
plus|prep|➕|زائد|Added to.|Two plus two is four.|4|num
minus|prep|➖|ناقص|Taken away from.|Five minus two is three.|4|num
times|prep|✖️|ضرب (×)|Multiplied by.|Three times four is twelve.|5|num
equal|adj|🟰|يساوي|The same in size or number.|Two plus two is equal to four.|5|num
pair|n|👟|زوج|Two things that go together.|I need a new pair of shoes.|5|num
money|n|💵|نقود / مال|What you use to buy things.|I save my money.|4|num
riyal|n|💵|ريال|The money of Saudi Arabia.|This juice costs three riyals.|4|num
price|n|🏷️|سعر|How much money something costs.|What is the price of this bag?|5|num
many|adj|🔢|كثير (للمعدود)|A large number of.|There are many stars.|4|num
much|adj|🫙|كثير (لغير المعدود)|A large amount of.|Don't eat too much sugar.|5|num
more|adj|➕|أكثر|A bigger number or amount.|Can I have more rice?|4|num
less|adj|➖|أقل|A smaller amount.|Use less water.|5|num
all|adj|🌐|كل / جميع|Every one.|All the students are here.|4|num
some|adj|🫘|بعض|A few; a part of.|Can I have some water?|4|num
every|adj|🔁|كل|Each one.|I brush my teeth every day.|4|num
both|adj|✌️|كلا / كلاهما|The two of them.|Both my brothers are tall.|5|num
number line|n|📏|خط الأعداد|A line with numbers in order.|Find seven on the number line.|5|num
shape|n|🔷|شكل|The form of something, like a circle or a square.|What shape is the clock?|4|col
oval|n|🥚|بيضاوي|A shape like an egg.|An egg is an oval.|5|col
diamond|n|🔷|معيّن / ماسة|A shape with four equal sides standing on a point.|Draw a diamond.|5|col
line|n|📏|خط|A long thin mark.|Draw a straight line.|4|col
dot|n|⚫|نقطة|A small round spot.|Join the dots.|4|col
gold|adj|🥇|ذهبي|The color of gold.|He won a gold medal.|4|col
silver|adj|🥈|فضي|The color of silver.|She has a silver ring.|5|col
dark blue|adj|🔵|أزرق داكن|A deep blue color.|The night sky is dark blue.|4|col
light blue|adj|🩵|أزرق فاتح|A pale blue color.|The baby's room is light blue.|4|col
colorful|adj|🌈|ملوّن|Having many bright colors.|The parrot is colorful.|5|col
Allah|n|☪️|الله|The name of God in Islam.|We thank Allah for everything.|3|life
Quran|n|📖|القرآن الكريم|The holy book of Islam.|I read the Quran every day.|3|life
prayer|n|🤲|صلاة / دعاء|Speaking to Allah; Muslims pray five times a day.|The first prayer is Fajr.|4|life
Ramadan|n|🌙|رمضان|The month when Muslims fast from dawn until sunset.|We fast in Ramadan.|3|life
Eid|n|🎉|العيد|A happy Muslim celebration after Ramadan or Hajj.|We wear new clothes on Eid.|3|life
fast|v|🌙|يصوم|To not eat or drink for some time.|Muslims fast in Ramadan.|4|life
Hajj|n|🕋|الحج|The journey to Makkah that Muslims make.|My grandfather went to Hajj.|4|life
Kaaba|n|🕋|الكعبة|The holy building in Makkah that Muslims pray toward.|Muslims face the Kaaba when they pray.|4|life
Makkah|n|🕋|مكة المكرمة|The holiest city in Islam.|We visited Makkah for Umrah.|4|life
Madinah|n|🕌|المدينة المنورة|A holy city where the Prophet's Mosque is.|We prayed in Madinah.|4|life
charity|n|🤲|صدقة|Giving help or money to people who need it.|We give charity to the poor.|5|life
manners|n|🙏|آداب / أخلاق|Polite ways of behaving.|Good manners are important.|5|life
please|adv|🙏|من فضلك|A polite word when you ask for something.|Water, please.|3|life
thank you|adv|🙏|شكرًا لك|What you say when someone helps or gives you something.|Thank you for your help.|3|life
sorry|adj|😔|آسف|What you say when you did something wrong.|I'm sorry I'm late.|3|life
hello|adv|👋|مرحبًا|What you say when you meet someone.|Hello! How are you?|3|life
goodbye|adv|👋|مع السلامة|What you say when you leave.|Goodbye, see you tomorrow.|3|life
welcome|adj|🤗|أهلًا وسهلًا|A friendly word to greet a guest.|Welcome to our home!|4|life
excuse me|adv|🙋|عفوًا / لو سمحت|Polite words to get someone's attention.|Excuse me, where is the library?|4|life
National Day|n|🇸🇦|اليوم الوطني|The day Saudi Arabia celebrates its unity, 23 September.|We wear green on National Day.|5|life
tradition|n|🏺|عادة / تقليد|Something people have done the same way for a long time.|Arabic coffee is a Saudi tradition.|5|life
celebrate|v|🎊|يحتفل|To do something fun for a special day.|We celebrate Eid with our family.|5|life
routine|n|🔄|روتين|The things you do every day in the same order.|My morning routine is short.|5|life
chores|n|🧹|أعمال المنزل|Small jobs at home, like cleaning.|I help with chores at home.|5|life
shopping|n|🛒|التسوق|Going to shops to buy things.|We go shopping on Thursday.|4|life
news|n|📰|أخبار|New information about things that happened.|Dad watches the news.|5|life
message|n|💬|رسالة|Words you send to someone.|I sent my friend a message.|4|life
email|n|📧|بريد إلكتروني|A message sent by computer.|Send me an email.|5|life
photo|n|📷|صورة فوتوغرافية|A picture taken with a camera.|Look at this photo of my family.|4|life
secret|n|🤫|سر|Something you don't tell other people.|Can you keep a secret?|5|life
problem|n|🧩|مشكلة|Something that is difficult and needs to be solved.|We solved the problem together.|5|life
plan|n|🗒️|خطة|What you decide to do later.|What's your plan for the weekend?|5|life
dream|n|💭|حلم|Pictures in your mind while you sleep; or a big wish.|My dream is to be an astronaut.|5|life
fact|n|📌|حقيقة|Something that is true.|It's a fact that the Earth is round.|5|sci
star|n|✨|نجم|A huge ball of burning gas in space, like the sun.|The sun is a star.|5|sci
Mars|n|🔴|المريخ|The red planet, next to Earth.|Mars is called the red planet.|5|sci
solar system|n|🪐|المجموعة الشمسية|The sun and the planets that move around it.|There are eight planets in our solar system.|5|sci
gravity|n|🍎|الجاذبية|The force that pulls things down to the ground.|Gravity makes the apple fall.|5|sci
liquid|n|💧|سائل|Something that flows, like water.|Milk is a liquid.|5|sci
solid|n|🧊|صلب|Something hard with its own shape, like ice.|Ice is a solid.|5|sci
gas|n|💨|غاز|Something like air that has no shape.|Steam is a gas.|5|sci
metal|n|🔩|معدن|A hard material like iron or gold.|The spoon is made of metal.|5|sci
wood|n|🪵|خشب|The hard material that trees are made of.|The table is made of wood.|4|sci
plastic|n|🧴|بلاستيك|A light material used to make bottles and toys.|Recycle plastic bottles.|5|sci
glass|n|🪟|زجاج|A hard clear material used for windows.|The window is made of glass.|5|sci
battery|n|🔋|بطارية|A small thing that stores electricity.|The toy needs new batteries.|5|sci
machine|n|⚙️|آلة|A thing with parts that does work.|A washing machine washes clothes.|5|sci
tool|n|🧰|أداة|A thing you use to do a job, like a hammer.|A hammer is a tool.|5|sci
keyboard|n|⌨️|لوحة المفاتيح|The part of a computer with keys for typing.|Type your name on the keyboard.|5|sci
mouse|n|🖱️|فأرة الحاسوب|A small thing you move to control a computer.|Click with the mouse.|4|sci
game console|n|🎮|جهاز ألعاب|A machine you play video games on.|My brother has a new game console.|5|sci
password|n|🔑|كلمة المرور|A secret word to open your account.|Never share your password.|5|sci
website|n|🌐|موقع إلكتروني|Pages you can visit on the internet.|This website has good stories.|5|sci
app|n|📲|تطبيق|A program on a phone or tablet.|I learn English with an app.|5|sci
type|v|⌨️|يكتب (على لوحة المفاتيح)|To write with a keyboard.|Type the word.|5|sci
click|v|🖱️|ينقر|To press a button on a mouse or screen.|Click on the picture.|5|sci
charge|v|🔌|يشحن|To fill a battery with electricity.|Charge your tablet tonight.|5|sci
discover|v|🔍|يكتشف|To find something new.|Scientists discover new things every day.|5|sci
invent|v|💡|يخترع|To make something new that did not exist.|Who invented the telephone?|5|sci
float|v|🛟|يطفو|To stay on top of water.|Wood floats on water.|5|sci
sink|v|⚓|يغرق|To go down under water.|A stone sinks in water.|5|sci
`;

/** what the voice maker records for the dictionary (tools/speech_list.js): each English word and example sentence,
    and the Arabic meaning shown in «Learn Arabic» (the first meaning, without brackets, the same as app.js arHead) */
APPDATA.dict.speakables = () => {
  const out = [];
  APPDATA.dict.RAW.trim().split('\n').filter(l => l.split('|').length === 8).forEach(l => {
    const [w, , , a, , ex] = l.split('|');
    out.push([w, 'en'], [ex, 'en'], [a.split('/')[0].replace(/\(.*?\)/g, '').trim(), 'ar']);
  });
  return out;
};
