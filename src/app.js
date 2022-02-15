
App = {
    loading: false,
    contracts: {},

    load: async () => {
      await App.loadWeb3(); 
      await App.loadAccount()
      await App.loadContract() 
      await App.render() 
    },
    loadWeb3:async()=>{ 
      const web3 = new Web3(Web3.givenProvider); // is metamask provider 
      window.web3 =web3
      web3.eth.net.isListening()
         .then(()=>{
           console.log("Web3 is connected")
         })
         .catch(e => console.log('Wow. Something went wrong'));
       
    },
    loadAccount: async () => {
      // Set the current blockchain account
      const accounts = await ethereum.request({ method: 'eth_accounts' }); 
      App.account = accounts[0] 
    },
  
    loadContract:async()=>{
         // connect to contract
      const jsonContract=await $.getJSON('Contacts.json')
      const contract_Address="0x702f1C30b26Af124209025161c58068216b2602C"; 
      const contract = new web3.eth.Contract(jsonContract.abi, contract_Address, {
        from: '0x64091cF01f32C104DbBB80b57C537738d171A253', // default from address
        gasPrice: '1000000' // default gas price in wei, 20 gwei in this case
      }); 
      App.contactList=contract  
      contract.methods.totalContacts().call().then(console.log);
    },
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account) 
      // Render Tasks
      await App.renderContacts()
  
      // Update loading state
      App.setLoading(false)
    },
    renderContacts: async () => {
      // Load the total task count from the blockchain
      const contactCounts = await App.contactList.methods.totalContacts().call()
    
      // Render out each task with a new task template
      for (var i = 1; i <= contactCounts; i++) {
        // Fetch the contact data from the blockchain
        const contact = await App.contactList.methods.contacts(i).call()
        const id=contact[0]
        const name = contact[1]
        const phone = contact[2]
        const desc = contact[3]
  
        // Create the html for the contact
        var row="<tr><th  scope='row'>"+i+"</th>";
        row+="<td>"+name+"</td>";
        row+="<td>"+phone+"</td>";
        row+="<td>"+desc+"</td>";
        row+=` <td>
                <a href='#' class='btn btn-info' onclick='App.popupEdit("${id}","${name}","${phone}","${desc}\")'>
                    <i class='fas fa-edit'></i>
                </a>
              </td>`;
        row+=` <td>
                <a href='#' class='btn btn-info' onclick='App.deleteContact("${id}")'>
                    <i class='fas fa-trash'></i>
                </a>
            </td>`;
        $('#contactList').append(row)
      }
    },
  
    createContact: async () => {
      App.setLoading(true)
      const name = $('#contactName').val()
      const phone = $('#contactPhone').val()
      const desc = $('#desc').val()
      const gas = await  App.contactList.methods.createContact(name,phone,desc).estimateGas();
      const saveContact = await  App.contactList.methods.createContact(name,phone,desc).send({
        from: App.account,
        gas,
      }); 
      console.log(saveContact)
      window.location.reload()
    },
    popupEdit:(id,name,phone,desc)=>{ 
        $('.editBody').find('#edName').val(name)
        $('.editBody').find('#edPhone').val(phone)
        $('.editBody').find('#edDesc').val(desc)
        $('.editBody').find('#cid').val(id)
        $('#editContactModel').modal('show');
    },
    editContact: async () => {
        const name = $('#edName').val()
        const phone = $('#edPhone').val()
        const desc = $('#edDesc').val()
        const id = $('#cid').val()
        const gas = await  App.contactList.methods.editContact(id,name,phone,desc).estimateGas();
        const editContact = await  App.contactList.methods.editContact(id,name,phone,desc).send({
          from: App.account,
          gas,
        });  
        console.log(editContact)
       $('#editContactModel').modal('hide');
       App.setLoading(true)
       window.location.reload()
    },
    deleteContact:async(id)=>{
        App.setLoading(true)
        const gas = await  App.contactList.methods.deleteContact(id).estimateGas();
        const deleteContact = await  App.contactList.methods.deleteContact(id).send({
          from: App.account,
          gas,
        });  
        console.log(deleteContact) 
        window.location.reload()
    },
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })