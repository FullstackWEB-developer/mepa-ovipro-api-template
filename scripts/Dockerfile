FROM ubuntu:latest

# Update aptitude with new repo
RUN apt-get update

# Install software 
RUN apt-get install -y git

ADD previewBranch.sh /root
ADD repositories.txt /root
RUN chmod +x /root/previewBranch.sh

ENV branch=
ENV action=

# add credentials on build
ARG SSH_PRIVATE_KEY=${SSH_PRIVATE_KEY}
RUN mkdir /root/.ssh/
RUN echo "${SSH_PRIVATE_KEY}" > /root/.ssh/id_rsa
RUN cat /root/.ssh/id_rsa
RUN \
    chmod 700 /root/.ssh &&\
    chmod 600 /root/.ssh/id_rsa 

# make sure your domain is accepted
RUN touch /root/.ssh/known_hosts
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts
ENTRYPOINT ["/root/previewBranch.sh"]
