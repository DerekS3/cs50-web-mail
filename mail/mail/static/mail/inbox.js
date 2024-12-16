document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-element').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Event listener for sending mail
  document.querySelector('#compose-form').onsubmit = send_email;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-element').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch_emails(mailbox)
}

function open_email(email) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-element').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  email.read = true;

  // Use email subject as page title
  document.querySelector('#email-element').innerHTML = `
    <h3>${email.subject}</h3>
    <p> from: ${email.sender} ${email.timestamp} </p>
    <p> to: ${email.recipients.join(', ')} </p>
    <p> ${email.body}</p>
  `;



  console.log('This email has been opened')
}

function fetch_emails(mailbox) {

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    emails.forEach(email => {
      preview_email(email, mailbox)
    });
  });
}



function preview_email(email, mailbox) {

  // Determine whether to show Sender or Recipient
  let displayContact;
  if (mailbox === 'sent') {
    displayContact = `<strong>To:</strong> ${email.recipients.join(', ')}`;
  } else {
    displayContact = `<strong>From:</strong> ${email.sender}`;
  }

  // Create email preview
  const emailElement = document.createElement('div');
  emailElement.classList.add('email-item');
  emailElement.classList.toggle('email-read', email.read === true);
  emailElement.classList.toggle('email-unread', email.read !== true);
  emailElement.innerHTML = `
    <p><small> ${displayContact} - ${email.timestamp} </small></p>
    <p><strong> ${email.subject} </strong></p>
    <p><small> </small></p>
  `;

  // Open email on click
  emailElement.addEventListener('click', () => {
    open_email(email)
  });

  // Add post to DOM
  document.querySelector('#emails-view').append(emailElement)

}

function send_email(event) {
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}