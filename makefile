help: ; @cat ./makefile
ssh: ; ssh -p 21098 wyncbqna@wynchar.com
cp: ; git st; git commit -am"checkpoint"
st: ; git st
diff: ; git diff
fns: ; firebase deploy --only functions
upweb: ; rsync -CPazv -e "ssh -p 21098" build/web/ wyncbqna@wynchar.com:public_html/smart
# push change to github
uptogithub uphub: ; git push origin master

