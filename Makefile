
ADDLICENSECMD=docker run -it --rm -v ${PWD}:/src ghcr.io/google/addlicense -c "Couchbase, Inc." -y "2011-2021"

.PHONY: addlicense
addlicense:
	@ADDLICENSEOUT=`$(ADDLICENSECMD) . 2>&1`; \
		if [ "$$ADDLICENSEOUT" ]; then \
			echo "$(ADDLICENSECMD) FAILED => add License errors:\n"; \
			echo "$$ADDLICENSEOUT\n"; \
			exit 1; \
		else \
			echo "Add License finished successfully"; \
		fi

.PHONY: checklicense
checklicense:
	@ADDLICENSEOUT=`$(ADDLICENSECMD) -check . 2>&1`; \
		if [ "$$ADDLICENSEOUT" ]; then \
			echo "$(ADDLICENSE) FAILED => add License errors:\n"; \
			echo "$$ADDLICENSEOUT\n"; \
			echo "Use 'make addlicense' to fix this."; \
			exit 1; \
		else \
			echo "Check License finished successfully"; \
		fi
