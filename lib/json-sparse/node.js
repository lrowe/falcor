module.exports = function(opts, set, depth, key, isKeySet) {
    
    var offset   = opts.offset;
    var values   = opts.values;
    var jsonRoot = values && values[0];
    
    // Only create a node if:
    //  1. The caller supplied a JSON root seed.
    //  2. The path depth is past the bound path length.
    //  3. The current node is a branch or reference.
    if(jsonRoot != null && depth >= offset) {
        
        var node  = opts.node;
        var type  = opts.type;
        var keysets  = opts.keysets;
        keysets[depth] = key;
        
        if((!type && node != null && typeof node == "object") || (type == "reference")) {
            
            var jsons = opts.jsons;
            var jsonKey = undefined;
            var jsonDepth = depth;
            var jsonParent, json;
            
            do {
                if (jsonKey == null) { jsonKey = keysets[jsonDepth]; }
                if ((jsonParent = jsons[--jsonDepth]) != null && (jsonKey != null)) {
                    if((json = jsonParent[jsonKey]) == null) {
                        json = jsonParent[jsonKey] = Object.create(null);
                    } else if(typeof json !== "object") {
                        throw new Error("Fatal Falcor Error: encountered value in branch position while building Path Map.");
                    }
                    jsonParent = json;
                    break;
                }
            } while(jsonDepth >= offset - 2);
            
            jsons[depth] = jsonParent;
        }
    }
    return true;
}