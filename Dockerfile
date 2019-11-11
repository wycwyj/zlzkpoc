FROM tomcat
RUN ["rm", "-rf", "/usr/local/tomcat/webapps/*"]
ADD war/backstage-web /usr/local/tomcat/webapps/backstage-web
ADD war/workflow-web /usr/local/tomcat/webapps/workflow-web

CMD ["catalina.sh", "run"]
