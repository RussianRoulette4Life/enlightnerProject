<script>
    export let appear = true
    export let allSideElems = []
    const handleOpen = (number) =>{
        //allSideElems.forEach(element => {
        //    if (element.number === number){
        //        element.showExtra =! element.showExtra
        //        console.log(`element number ${element.number}, number var passed to func = ${number}${element.showExtra}`)
        //    }
        //}
        //)
        allSideElems[number].showExtra=!allSideElems[number].showExtra
    }
</script>
{#if appear}    
    <div class="sideBar">
        <div class="logo">
            <h1>MY TWITTER CLONE</h1>
        </div>
        {#each allSideElems as Elem (Elem.number)}
            <div class="sideElem" on:click={(e)=>handleOpen(Elem.number)}>
                <h1 style="text-align: center;">{Elem.number+1}. {Elem.content}</h1>
                {#if Elem.showExtra}
                    {#each Elem.extraContent as extraContentNugget}
                        <div class="selectableSegment"><p>{extraContentNugget}</p></div>
                    {/each}
                {:else}
                <p style="font-size:10pt;">!Click for more info!</p>                    
                {/if}
            </div>
        {/each}
    </div>
{/if}
<style>
    .sideBar{
        overflow: scroll;
        display:flex;
        position: fixed;
        flex-direction: column;
        height: 100%;
        border: 5px rgb(148, 69, 41) solid;
        width: 24%;
        text-align: center;
    }
    .sideElem{
        padding: 5px 0px 5px 0px;
        background: rgba(41, 44, 139, 0.473);
        padding: 20px 25% 20px 25%;
        width:50%;
        border-top: 5px rgb(148, 69, 41) solid;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .sideBar > .logo{
        background: rgb(39, 39, 39);
        text-align: center;
    }
    .sideElem:hover, .selectableSegment:hover{
        background: rgba(50, 56, 240, 0.473);
        border-top: 5px rgb(219, 87, 39) solid;
        cursor: pointer;
    }
    .selectableSegment{
        background: rgba(41, 44, 139, 0.473);
        padding: auto;
        border: 3px solid #944529;
        width: 195%;
        justify-content: center;
    }
</style>