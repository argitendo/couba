# Schedule a Node.js Script Using Crontab on Ubuntu

This guide explains how to schedule a Node.js script to run automatically on Ubuntu using `crontab`.

## Steps to Schedule Your Script

1. **Locate Your Node.js Script**:
   - Make sure you know the absolute path to your Node.js script.
   - Example: `/home/user/scripts/my_script.js`

2. **Find the Path to Node.js**:
   - Run the following command to find the absolute path to Node.js:
     ```bash
     which node
     ```
   - Example output: `/usr/bin/node`

3. **Edit the Crontab File**:
   - Open the crontab file for editing by running:
     ```bash
     crontab -e
     ```

4. **Add Your Cron Job**:
   - Add a new line to schedule your script. The format for a cron job is:
     ```
     * * * * * /path/to/node /path/to/your_script.js
     ```
   - Example to run the script every day at midnight:
     ```
     0 0 * * * /usr/bin/node /home/user/scripts/my_script.js
     ```

5. **Save and Exit**:
   - After adding your cron job, save the file and exit the editor.

6. **Verify the Crontab**:
   - Check your cron jobs by running:
     ```bash
     crontab -l
     ```

7. **Ensure Permissions**:
   - Make sure your script has execute permissions by running:
     ```bash
     chmod +x /home/user/scripts/my_script.js
     ```

8. **Check Logs (Optional)**:
   - If your script doesn't run as expected, check the cron logs for errors:
     ```bash
     grep CRON /var/log/syslog
     ```

## Example Cron Job Entry

This example runs a Node.js script every day at midnight and logs the output:

```bash
0 0 * * * /usr/bin/node /home/user/scripts/my_script.js >> /home/user/scripts/my_script.log 2>&1
```

This entry redirects the output and errors to my_script.log for debugging purposes.