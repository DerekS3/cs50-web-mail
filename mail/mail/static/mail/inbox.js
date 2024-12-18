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

  set_read_status(email.id, true);

  // Use email subject as page title
  document.querySelector('#email-element').innerHTML = `
    <h3>${email.subject}</h3>
    <div class="email-info">
      <strong>From: </strong>${email.sender} - ${email.timestamp}
      <br><strong>To: </strong>${email.recipients.join(', ')}
    </div>
    <pre> ${email.body}</pre>
    <hr>
    <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
    <button class="btn btn-sm btn-outline-primary" id="archive">
      ${email.archived ? 'Unarchive' : 'Archive'}
    </button>
    <button class="btn btn-sm btn-outline-primary" id="read-status">Mark as unread</button>
  `;

  document.querySelector('#reply').addEventListener('click', () => {
    reply_to_email(email)
  })

  document.querySelector('#archive').addEventListener('click', () => {
    set_archived_status(email.id, email.archived)
  })

  document.querySelector('#read-status').addEventListener('click', function () {
    set_read_status(email.id, !email.read);
    this.innerHTML = 'Marked as unread';
    this.disabled = true;    
  })
}

function reply_to_email(email) {

  // Show reply view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-element').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Populate composition fields
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `
    \n\n
    -----
    On ${email.timestamp}, ${email.sender} wrote:\n
    ${email.body}
  `;

  // Event listener for sending mail
  document.querySelector('#compose-form').onsubmit = send_email;
}

function set_read_status(email_id, status) {

  // Update read status on the server
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: status
    })
  })
}

function set_archived_status(email_id, status) {

  // Update archived status on the server
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !status
    })
  })
  .then(() => {
    load_mailbox('inbox');
  })
  .catch(error => {
    console.error('Error archiving email:', error);
  });
}

function fetch_emails(mailbox) {

  // Retrieve emails from server
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

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