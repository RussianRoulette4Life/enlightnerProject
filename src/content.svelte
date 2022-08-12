<script>
    export let realMSG = false
    // this bit is here to change the size of each content element depending on what state the createMSG block is at
    $: {setTimeout(()=>{ 
    if (!realMSG){
        document.querySelector('.content').style.maxWidth = `65%`
    } else{
        document.querySelector('.content').style.maxWidth = `45%`
    
    }
    },90)
    }
</script>
<!-- boilerplate stuff -->
<div class="content">
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
    <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
        <div class="tweet">
        <header><h1>lorem ipsum</h1></header>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.</p>
    </div>
</div>

<style>
    .content{
        max-width: 45%;
        position: relative;
        left:26%;
    }
    .tweet{
        background:#1e205e;
        border-top-left-radius: 50px;
        border-top-right-radius:50px;
        margin:10px 20px;
        border: 5px solid #8f4731;
    }
    .tweet > header{
        background: rgb(45, 49, 158);
        padding: 1px 0px;
        border-radius: 50px;
        text-align: center;
        border-bottom: 5px solid #843f2a;
    }
    .tweet > p{
        margin:0px 10px;
    }
</style>