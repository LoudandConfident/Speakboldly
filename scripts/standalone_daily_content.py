"""Each fiction scene is a complete independent visit, not an episode."""
CONTEXTS={
'Sunny Street: an original café series':'Nora, Sami, Leila and Omar meet for an afternoon at a neighbourhood café.',
'The Saturday Film Club':'Four friends, Nora, Sami, Leila and Omar, meet at a film club to make a short scene together.',
'Postcards from the little library':'Nora, Sami, Leila and Omar visit a library that offers a table for writing postcards.',
'The picnic train: an original travel story':'Four friends, Nora, Sami, Leila and Omar, take a day trip by train and enjoy a picnic.',
'The bookshop bookmark series':'Nora, Sami, Leila and Omar visit a bookshop with a table for making bookmarks.',
'The neighbourhood fair':'Four neighbours, Nora, Sami, Leila and Omar, help at a small local fair.',
'The little neighbourhood radio show':'Nora, Sami, Leila and Omar meet to write a short radio script for their neighbourhood.',
'The tiny city film studio':'Four friends, Nora, Sami, Leila and Omar, gather at a craft table to design a small paper film set.'}
# These visits previously referred to a week's accumulated work or an earlier project.
REPLACEMENTS={
'Seven little ideas':('An afternoon of small ideas','Nora invites Sami, Leila and Omar to a café. Each friend brings one small idea: a drawing, a reading question, a game or a piece of music.','They try the ideas during one afternoon and choose a favourite. Everyone leaves with something new to enjoy.'),
'An imaginary town map':('An imaginary town map','Nora, Sami, Leila and Omar each draw a postcard of an imaginary place at the library. They arrange the four new cards on a large sheet and draw paths between them.','By the end of the visit, their separate drawings form one cheerful town that another reader can explore.'),
'A journey to share':('A journey to share','Four friends take a day trip by train. On the return journey, Nora and Sami describe the view while Leila and Omar write about their picnic.','They combine their notes into a complete travel story and read it together before they reach home.'),
'A shelf of little stories':('A shelf of little stories','A bookshop invites Nora, Sami, Leila and Omar to write one tiny story each. They write the stories on cards and place them on a shelf by the entrance.','Before leaving, they watch a visitor choose a card and smile at its ending. Their little display has found its first reader.'),
'A fair to remember':('A fair to remember','Nora, Sami, Leila and Omar help at a neighbourhood fair for one afternoon. As the stalls close, they ask visitors which small arrangement made the day enjoyable.','They put the comments on a thank-you board. The completed board celebrates the afternoon and the people who made it welcoming.'),
'The script on display':('The script on display','Leila brings a short, complete radio script to a café workshop. Nora, Sami and Omar help arrange its pages on a noticeboard with a clear title and reading order.','A visitor reads the whole script and points out a favourite line. The group discovers that a radio story can also be enjoyed on paper.'),
'The tiny city exhibition':('The tiny city exhibition','Leila brings a paper café and library to a small craft exhibition. Nora adds a bench, Sami draws a path, and Omar places two card figures beside the café.','They label the finished scene and invite visitors to describe it. Each visitor can imagine a complete little meeting in the handmade city.')}

def make_standalone(themes):
    for theme in themes:
        if theme['kind']!='Original story':continue
        theme['standaloneContext']=CONTEXTS[theme['name']]
        theme['name']=theme['name'].replace(': an original café series',': café stories').replace('The bookshop bookmark series','Bookshop stories')
        for scene in theme['scenes']:
            if scene['title'] in REPLACEMENTS:
                scene['title'],scene['scene'],scene['outcome']=REPLACEMENTS[scene['title']]


def load_past_stories(themes, root):
    rows=[line.split('|') for line in (root/'content/daily-standalone-stories.txt').read_text().splitlines() if line and not line.startswith('#')]
    assert len(rows)==56 and all(len(row)==5 for row in rows)
    fiction=[t for t in themes if t['kind']=='Original story']
    assert len(fiction)==8
    for theme,group in zip(fiction,[rows[i:i+7] for i in range(0,56,7)]):
        for scene,row in zip(theme['scenes'],group):
            title,opening,turn,ending,point=row
            scene.update(title=title,scene=opening+' '+turn,outcome=ending,point=point,pastStory=True)
