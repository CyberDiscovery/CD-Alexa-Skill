var assert = require("assert");

var mainthing = require("..")

describe("Date Thing", function() {
	describe("Date responses", function() {
		it("should mention the 6th of november when asked when assess started", function() {
			mainthing.onIntent({"intent":{"name":"assess_start_date"}}, {}, function(a, b){
				assert(b.outputSpeech.text.includes("6th of November"));
			})
		})
	})
})

