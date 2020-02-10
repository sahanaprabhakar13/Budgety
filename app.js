//BUDGET CONTROLLER
var budgetController = (function(){
 
    var Expenses = function (id,desc,value){

        this.id=id;
        this.description=desc;
        this.value=value;

    };
    var Income = function (id,desc,value){

        this.id=id;
        this.description=desc;
        this.value=value;

    };
    var calculateTotal = function(type){

        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]=sum;


    }
    var data ={
        allItems :{
            inc :[],
            exp : []
        },
        totals: {
            exp :0,
            inc : 0

        },
        budget :0,
        percentage : -1
    };
   return {
    addItem:function(type,des,val){

        var newItem,id;

        //create new id
        if(data.allItems[type].length>0){
        id=data.allItems[type][data.allItems[type].length-1].id + 1;}
        else
        {
            id=0;
        }

        //create new item as inc or exp
        if(type==='exp'){
        
            newItem=new Expenses(id,des,val);
        }
        else if(type=== 'inc')
        {
            newItem= new Income(id,des,val);

        }
        //push it to our DS
        data.allItems[type].push(newItem);

        //return new item
        return newItem;

    },
    deleteitem: function(type,id){
        
        var ids=data.allItems[type].map(function(cur){
            return cur.id;

        });
       var index = ids.indexOf(id);
       
       if(index !== -1){
        data.allItems[type].splice(index,1);

       }

    },
    calculateBudget : function(){
        //calculate total inc n exp
        calculateTotal('inc');
        calculateTotal('exp');
        //calcilate budget inc-exp
        
        data.budget = data.totals.inc - data.totals.exp;
        //calculate percentage of income we spent
        if(data.totals.inc>0){
        data.percentage= Math.round((data.totals.exp/data.totals.inc)*100);
        }
        else {
            data.percentage=-1;
        }
    },
    getBudget:function(){
        return {
            budget:data.budget,
            totalInc:data.totals.inc,
            totalExp:data.totals.exp,
            percentage :data.percentage
        }

    },
    testing:function(){
        console.log(data)
    }

   }
    
    
})();

//UI CONTROLLER

var UIController = (function(){

    var DOMString ={

        input_type:'.add__type',
        input_desc : '.add__description',
        input_num : '.add__value',
        input_btn :'.add__btn' ,
        incomeContainer :'.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel :'.budget__income--value',
        expenseLabel :'.budget__expenses--value',
        percentageLabel :'.budget__expenses--percentage',
        container:'.container'

    }
    return {
        getInput:function(){
            return{
            type: document.querySelector(DOMString.input_type).value,// will be inc or exp
            description : document.querySelector(DOMString.input_desc).value,
            value :  parseFloat(document.querySelector(DOMString.input_num).value)
        }

        },
        getNewItem:function(obj,type){

            var html,newHtml,element;
            if(type === 'inc'){
                element=DOMString.incomeContainer;
            html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type ==='exp'){
                element=DOMString.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },
        deleteListItem:function(selectorID){
            var el=document.getElementById(selectorID)
            el.parentNode.removeChild(el);

        },

         clearField :function(){
            var field ,fieldArray;
            field=document.querySelectorAll(DOMString.input_desc +',' + DOMString.input_num);

            fieldArray=Array.prototype.slice.call(field);
            fieldArray.forEach(function(cur,ind,arr){
                cur.value="";
            });
            fieldArray[0].focus();

        },
        displayBudget:function(obj){
            document.querySelector(DOMString.budgetLabel).textContent=obj.budget;
            document.querySelector(DOMString.incomeLabel).textContent=obj.totalInc;
            document.querySelector(DOMString.expenseLabel).textContent=obj.totalExp;

            if(obj.percentage >0){
            document.querySelector(DOMString.percentageLabel).textContent=obj.percentage + '%';
            }
            else{
                document.querySelector(DOMString.percentageLabel).textContent='----';
            }

        },

        getDOMStrings:function(){
            return DOMString;
        }
    }
})();

//CONTROLLER

var controller = (function(budgetCtrl,UICtrl){
    var setUpEventListener = function(){

        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.input_btn).addEventListener("click",ctrlAddItem) ;
   
        document.addEventListener("keypress",function(event){

        if(event === 13  || event.which === 13)
        {
             ctrlAddItem();

        }   
    });
    document.querySelector(DOM.container).addEventListener("click" , ctrlDeleteItem);
    };
        
    var updateBudget =function(){
        //calculate budget

        budgetCtrl.calculateBudget();
        //return the budget
        var budget = budgetCtrl.getBudget();
        //display the budget on UI
        UICtrl.displayBudget(budget);

    }
    var ctrlAddItem = function(){
        
    //1.get input data

    var inp = UICtrl.getInput();
    
    //2.add item to budget controller
    if(inp.description !== "" &&  !isNaN(inp.value) && inp.value>0){
    var newItem=budgetCtrl.addItem(inp.type,inp.description,inp.value);

    //3,.additem to UI
    var addItem = UICtrl.getNewItem(newItem,inp.type);
    // to clear fields
    UICtrl.clearField();

     //4.calculate budget
     
     updateBudget();

    }
    }
    var ctrlDeleteItem = function(event){
        var item_id;
        item_id=(event.target.parentNode.parentNode.parentNode.parentNode.id);
        
        if(item_id){
            var splitId=item_id.split('-');
            type=splitId[0];
            ID=parseInt(splitId[1]);
            //delete from ds
            budgetCtrl.deleteitem(type,ID);
            //delete from UI
            UICtrl.deleteListItem(item_id);
            //update n show BUDGET
            updateBudget();

        }

    }

    return {

        init:function (){
            console.log("Application started");
            UICtrl.displayBudget({
                budget:0,
            totalInc:0,
            totalExp:0,
            percentage :0
            });
            setUpEventListener();
            
        }
    }

})(budgetController,UIController);

controller.init();







