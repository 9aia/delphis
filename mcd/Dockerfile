FROM ubuntu

RUN apt-get update && apt-get install -y openssh-server git

RUN mkdir /var/run/sshd /delphis

RUN chmod -R 777 /delphis

RUN echo "Port 22444" >> /etc/ssh/sshd_config

COPY ./mcd/start.sh ./start.sh
COPY ./dist/delphis-mcd ./delphis-mcd

RUN chmod +x /start.sh

CMD ["./start.sh"]
