 var expect = require('chai').expect;
 var chartit = require('./index'); 
 var config=
 {
    grid:{
        padding:{
            left:5
        }
    }
};
var chart=new chartit(config);

 describe('chartit', function(){
    it ('should work!',function(){
        expect(true).to.be.true;
    });
    it ('should merge the config Objects',function(){
        expect(chart.config).to.contain.all.keys({'grid':{'padding':['top','right','bottom','left']}});
    });
 });